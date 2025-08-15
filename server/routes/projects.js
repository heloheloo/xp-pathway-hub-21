import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authorize, isGroupAdmin } from '../middlewares/auth.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get projects (filtered by role)
// @access  Authenticated
router.get('/', async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'student') {
      // Students only see their own projects
      filter.studentId = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admins see projects from their group
      filter.groupId = req.user.groupId;
    }
    // Superadmin sees all projects (no filter)

    const projects = await Project.find(filter)
      .populate('studentId', 'username email')
      .populate('groupId', 'name')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Authenticated (with authorization)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'username email xp level')
      .populate('groupId', 'name')
      .populate('reviewedBy', 'username');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== project.studentId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'admin' && req.user.groupId?.toString() !== project.groupId._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

// @route   POST /api/projects
// @desc    Submit new project
// @access  Student only
router.post('/', [
  authorize('student'),
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').trim().notEmpty().withMessage('Project description is required'),
  body('githubUrl').optional().matches(/^https:\/\/github\.com\//).withMessage('Must be a valid GitHub URL'),
  body('liveUrl').optional().matches(/^https?:\/\//).withMessage('Must be a valid URL'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, githubUrl, liveUrl, technologies } = req.body;

    if (!req.user.groupId) {
      return res.status(400).json({ message: 'Student must be assigned to a group to submit projects' });
    }

    const project = new Project({
      title,
      description,
      studentId: req.user._id,
      groupId: req.user.groupId,
      githubUrl,
      liveUrl,
      technologies: technologies || []
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('studentId', 'username email')
      .populate('groupId', 'name');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    console.error('Submit project error:', error);
    res.status(500).json({ message: 'Server error submitting project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Student (own project), Admin, Superadmin
router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Project description cannot be empty'),
  body('githubUrl').optional().matches(/^https:\/\/github\.com\//).withMessage('Must be a valid GitHub URL'),
  body('liveUrl').optional().matches(/^https?:\/\//).withMessage('Must be a valid URL'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body('status').optional().isIn(['submitted', 'under_review', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization and field restrictions
    let allowedFields = [];
    
    if (req.user.role === 'student' && req.user._id.toString() === project.studentId.toString()) {
      // Students can only update basic project info, not status or review fields
      allowedFields = ['title', 'description', 'githubUrl', 'liveUrl', 'technologies'];
    } else if (req.user.role === 'admin') {
      // Admins can update status and review fields for projects in their group
      if (req.user.groupId?.toString() !== project.groupId.toString()) {
        return res.status(403).json({ message: 'Access denied to this project' });
      }
      allowedFields = ['status', 'reviewNotes', 'xpAwarded'];
    } else if (req.user.role === 'superadmin') {
      // Superadmin can update everything
      allowedFields = ['title', 'description', 'githubUrl', 'liveUrl', 'technologies', 'status', 'reviewNotes', 'xpAwarded'];
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filter allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Add review metadata if status is being updated by admin/superadmin
    if (updateData.status && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      updateData.reviewedBy = req.user._id;
      updateData.reviewedAt = new Date();

      // If approved and XP awarded, update student's XP
      if (updateData.status === 'approved' && updateData.xpAwarded > 0) {
        const student = await User.findById(project.studentId);
        if (student) {
          student.xp += updateData.xpAwarded;
          student.level = student.calculateLevel();
          await student.save();
        }
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('studentId', 'username email')
    .populate('groupId', 'name')
    .populate('reviewedBy', 'username');

    res.json({ success: true, data: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Student (own project), Admin, Superadmin
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== project.studentId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'admin' && req.user.groupId?.toString() !== project.groupId.toString()) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

export default router;
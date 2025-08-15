import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Project from '../models/Project.js';
import { authorize, isGroupAdmin } from '../middlewares/auth.js';

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students (filtered by admin's group if admin)
// @access  Admin, Superadmin
router.get('/', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    let filter = { role: 'student', isActive: true };
    
    // If admin, only show students from their group
    if (req.user.role === 'admin' && req.user.groupId) {
      filter.groupId = req.user.groupId;
    }

    const students = await User.find(filter)
      .select('-password')
      .populate('groupId', 'name')
      .sort({ xp: -1, createdAt: -1 });

    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Admin, Superadmin, Student (own profile)
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('groupId', 'name');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'admin' && req.user.groupId?.toString() !== student.groupId?.toString()) {
      return res.status(403).json({ message: 'Access denied to this student' });
    }

    // Get student's projects
    const projects = await Project.find({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: {
        ...student.toJSON(),
        projects
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Admin, Superadmin
router.post('/', [
  authorize('admin', 'superadmin'),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('groupId').optional().isMongoId().withMessage('Valid group ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, groupId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    // If admin, can only create students in their group
    let assignedGroupId = groupId;
    if (req.user.role === 'admin') {
      assignedGroupId = req.user.groupId;
    }

    // Validate group exists
    if (assignedGroupId) {
      const group = await Group.findById(assignedGroupId);
      if (!group) {
        return res.status(400).json({ message: 'Invalid group ID' });
      }
    }

    const student = new User({
      username,
      email,
      password,
      role: 'student',
      groupId: assignedGroupId
    });

    await student.save();

    const populatedStudent = await User.findById(student._id)
      .select('-password')
      .populate('groupId', 'name');

    res.status(201).json({ success: true, data: populatedStudent });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error creating student' });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Admin, Superadmin, Student (own profile - limited fields)
router.put('/:id', [
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('groupId').optional().isMongoId().withMessage('Valid group ID required'),
  body('xp').optional().isInt({ min: 0 }).withMessage('XP must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Authorization and field restrictions
    let allowedFields = [];
    
    if (req.user.role === 'student' && req.user._id.toString() === student._id.toString()) {
      // Students can only update their own basic info
      allowedFields = ['username', 'email'];
    } else if (req.user.role === 'admin') {
      // Admins can update students in their group
      if (req.user.groupId?.toString() !== student.groupId?.toString()) {
        return res.status(403).json({ message: 'Access denied to this student' });
      }
      allowedFields = ['username', 'email', 'xp'];
    } else if (req.user.role === 'superadmin') {
      // Superadmin can update everything
      allowedFields = ['username', 'email', 'groupId', 'xp'];
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

    // Recalculate level if XP is updated
    if (updateData.xp !== undefined) {
      updateData.level = Math.floor(updateData.xp / 100) + 1;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('groupId', 'name');

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (soft delete)
// @access  Admin, Superadmin
router.delete('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Authorization check for admin
    if (req.user.role === 'admin' && req.user.groupId?.toString() !== student.groupId?.toString()) {
      return res.status(403).json({ message: 'Access denied to this student' });
    }

    await User.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
});

// @route   POST /api/students/:id/give-xp
// @desc    Give XP to student
// @access  Admin, Superadmin
router.post('/:id/give-xp', [
  authorize('admin', 'superadmin'),
  body('amount').isInt({ min: 1 }).withMessage('XP amount must be positive'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason } = req.body;
    
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Authorization check for admin
    if (req.user.role === 'admin' && req.user.groupId?.toString() !== student.groupId?.toString()) {
      return res.status(403).json({ message: 'Access denied to this student' });
    }

    // Update XP and level
    student.xp += amount;
    student.level = student.calculateLevel();
    await student.save();

    res.json({ 
      success: true, 
      data: {
        id: student._id,
        username: student.username,
        xp: student.xp,
        level: student.level,
        xpAdded: amount,
        reason
      }
    });
  } catch (error) {
    console.error('Give XP error:', error);
    res.status(500).json({ message: 'Server error giving XP' });
  }
});

export default router;
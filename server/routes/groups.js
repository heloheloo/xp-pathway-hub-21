import express from 'express';
import { body, validationResult } from 'express-validator';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

// @route   GET /api/groups
// @desc    Get all groups
// @access  Authenticated
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ isActive: true })
      .populate('adminId', 'username email')
      .populate('studentCount')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error fetching groups' });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Authenticated
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('adminId', 'username email')
      .populate('studentCount');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Get students in this group
    const students = await User.find({ 
      groupId: group._id, 
      role: 'student',
      isActive: true 
    }).select('-password').sort({ xp: -1 });

    res.json({ 
      success: true, 
      data: {
        ...group.toJSON(),
        students
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error fetching group' });
  }
});

// @route   POST /api/groups
// @desc    Create new group
// @access  Superadmin only
router.post('/', [
  authorize('superadmin'),
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('adminId').isMongoId().withMessage('Valid admin ID is required'),
  body('description').optional().trim(),
  body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, adminId, maxStudents } = req.body;

    // Check if admin exists and has admin role
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid admin ID' });
    }

    // Check if admin is already assigned to another group
    const existingGroup = await Group.findOne({ adminId, isActive: true });
    if (existingGroup) {
      return res.status(400).json({ message: 'Admin is already assigned to another group' });
    }

    const group = new Group({
      name,
      description,
      adminId,
      maxStudents: maxStudents || 30
    });

    await group.save();

    // Update admin's groupId
    await User.findByIdAndUpdate(adminId, { groupId: group._id });

    const populatedGroup = await Group.findById(group._id)
      .populate('adminId', 'username email');

    res.status(201).json({ success: true, data: populatedGroup });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error creating group' });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Superadmin only
router.put('/:id', [
  authorize('superadmin'),
  body('name').optional().trim().notEmpty().withMessage('Group name cannot be empty'),
  body('description').optional().trim(),
  body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('adminId', 'username email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error updating group' });
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete group (soft delete)
// @access  Superadmin only
router.delete('/:id', authorize('superadmin'), async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove group association from admin and students
    await User.updateMany(
      { groupId: group._id },
      { $unset: { groupId: 1 } }
    );

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error deleting group' });
  }
});

export default router;
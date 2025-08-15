import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

// @route   GET /api/admins
// @desc    Get all admins
// @access  Superadmin only
router.get('/', authorize('superadmin'), async (req, res) => {
  try {
    const admins = await User.find({ 
      role: 'admin', 
      isActive: true 
    })
    .select('-password')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});

// @route   GET /api/admins/:id
// @desc    Get admin by ID
// @access  Superadmin only
router.get('/:id', authorize('superadmin'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id)
      .select('-password')
      .populate('groupId', 'name description');

    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Get admin's group and students count
    let groupData = null;
    if (admin.groupId) {
      const studentsCount = await User.countDocuments({ 
        groupId: admin.groupId._id, 
        role: 'student',
        isActive: true 
      });
      
      groupData = {
        ...admin.groupId.toJSON(),
        studentsCount
      };
    }

    res.json({ 
      success: true, 
      data: {
        ...admin.toJSON(),
        groupData
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: 'Server error fetching admin' });
  }
});

// @route   POST /api/admins
// @desc    Create new admin
// @access  Superadmin only
router.post('/', [
  authorize('superadmin'),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    const createdAdmin = await User.findById(admin._id)
      .select('-password')
      .populate('groupId', 'name');

    res.status(201).json({ success: true, data: createdAdmin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error creating admin' });
  }
});

// @route   PUT /api/admins/:id
// @desc    Update admin
// @access  Superadmin only
router.put('/:id', [
  authorize('superadmin'),
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const allowedFields = ['username', 'email'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedAdmin = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('groupId', 'name');

    res.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error updating admin' });
  }
});

// @route   DELETE /api/admins/:id
// @desc    Delete admin (soft delete)
// @access  Superadmin only
router.delete('/:id', authorize('superadmin'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if admin is assigned to a group
    if (admin.groupId) {
      const group = await Group.findById(admin.groupId);
      if (group) {
        return res.status(400).json({ 
          message: 'Cannot delete admin assigned to a group. Remove group assignment first.' 
        });
      }
    }

    await User.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
});

// @route   PUT /api/admins/:id/assign-group
// @desc    Assign admin to group
// @access  Superadmin only
router.put('/:id/assign-group', [
  authorize('superadmin'),
  body('groupId').isMongoId().withMessage('Valid group ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.body;

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if group already has an admin
    if (group.adminId && group.adminId.toString() !== admin._id.toString()) {
      return res.status(400).json({ message: 'Group already has an admin assigned' });
    }

    // Update both admin and group
    await Promise.all([
      User.findByIdAndUpdate(admin._id, { groupId }),
      Group.findByIdAndUpdate(groupId, { adminId: admin._id })
    ]);

    const updatedAdmin = await User.findById(admin._id)
      .select('-password')
      .populate('groupId', 'name');

    res.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error('Assign group error:', error);
    res.status(500).json({ message: 'Server error assigning group' });
  }
});

// @route   PUT /api/admins/:id/remove-group
// @desc    Remove admin from group
// @access  Superadmin only
router.put('/:id/remove-group', authorize('superadmin'), async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.groupId) {
      return res.status(400).json({ message: 'Admin is not assigned to any group' });
    }

    const groupId = admin.groupId;

    // Remove admin from group and group from admin
    await Promise.all([
      User.findByIdAndUpdate(admin._id, { $unset: { groupId: 1 } }),
      Group.findByIdAndUpdate(groupId, { $unset: { adminId: 1 } })
    ]);

    const updatedAdmin = await User.findById(admin._id)
      .select('-password')
      .populate('groupId', 'name');

    res.json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error('Remove group error:', error);
    res.status(500).json({ message: 'Server error removing group assignment' });
  }
});

export default router;
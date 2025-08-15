import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get leaderboard data
// @access  Public (or authenticated if you prefer)
router.get('/', async (req, res) => {
  try {
    const { groupId, limit = 50 } = req.query;

    let filter = { 
      role: 'student', 
      isActive: true,
      xp: { $gt: 0 } // Only show students with XP > 0
    };

    // Filter by group if specified
    if (groupId) {
      filter.groupId = groupId;
    }

    const students = await User.find(filter)
      .select('username xp level groupId')
      .populate('groupId', 'name')
      .sort({ xp: -1, level: -1, username: 1 })
      .limit(parseInt(limit));

    // Add ranking
    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      id: student._id,
      username: student.username,
      xp: student.xp,
      level: student.level,
      groupId: student.groupId?._id,
      groupName: student.groupId?.name
    }));

    // Get group statistics if no specific group filter
    let groupStats = null;
    if (!groupId) {
      const groupAggregation = await User.aggregate([
        {
          $match: { 
            role: 'student', 
            isActive: true, 
            groupId: { $exists: true, $ne: null } 
          }
        },
        {
          $group: {
            _id: '$groupId',
            totalStudents: { $sum: 1 },
            totalXP: { $sum: '$xp' },
            avgXP: { $avg: '$xp' },
            maxXP: { $max: '$xp' },
            avgLevel: { $avg: '$level' }
          }
        },
        {
          $lookup: {
            from: 'groups',
            localField: '_id',
            foreignField: '_id',
            as: 'groupInfo'
          }
        },
        {
          $unwind: '$groupInfo'
        },
        {
          $project: {
            groupId: '$_id',
            groupName: '$groupInfo.name',
            totalStudents: 1,
            totalXP: 1,
            avgXP: { $round: ['$avgXP', 1] },
            maxXP: 1,
            avgLevel: { $round: ['$avgLevel', 1] }
          }
        },
        {
          $sort: { totalXP: -1 }
        }
      ]);

      groupStats = groupAggregation;
    }

    res.json({ 
      success: true, 
      data: {
        leaderboard,
        groupStats,
        totalStudents: leaderboard.length,
        filters: {
          groupId,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   GET /api/leaderboard/groups
// @desc    Get group leaderboard
// @access  Public (or authenticated if you prefer)
router.get('/groups', async (req, res) => {
  try {
    const groupLeaderboard = await User.aggregate([
      {
        $match: { 
          role: 'student', 
          isActive: true, 
          groupId: { $exists: true, $ne: null } 
        }
      },
      {
        $group: {
          _id: '$groupId',
          totalStudents: { $sum: 1 },
          totalXP: { $sum: '$xp' },
          avgXP: { $avg: '$xp' },
          maxXP: { $max: '$xp' },
          topStudent: { $max: '$xp' }
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: '_id',
          as: 'groupInfo'
        }
      },
      {
        $unwind: '$groupInfo'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'groupInfo.adminId',
          foreignField: '_id',
          as: 'adminInfo'
        }
      },
      {
        $unwind: { path: '$adminInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          groupId: '$_id',
          groupName: '$groupInfo.name',
          adminName: '$adminInfo.username',
          totalStudents: 1,
          totalXP: 1,
          avgXP: { $round: ['$avgXP', 1] },
          maxXP: 1
        }
      },
      {
        $sort: { totalXP: -1 }
      }
    ]);

    // Add ranking
    const rankedGroups = groupLeaderboard.map((group, index) => ({
      rank: index + 1,
      ...group
    }));

    res.json({ 
      success: true, 
      data: rankedGroups
    });
  } catch (error) {
    console.error('Get group leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching group leaderboard' });
  }
});

export default router;
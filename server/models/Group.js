import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
groupSchema.index({ adminId: 1 });
groupSchema.index({ isActive: 1 });

// Virtual for student count
groupSchema.virtual('studentCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'groupId',
  count: true
});

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Group', groupSchema);
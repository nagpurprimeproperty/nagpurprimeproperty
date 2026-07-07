import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Optional: if set, this notification targets a specific user (per-user delivery)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  type: {
    type: String,
    enum: {
      values: [
        'system', 'alert', 'info', 'success', 'warning',
        // User-targeted event types
        'FIRST_PROPERTY', 'PLAN_PURCHASED', 'PLAN_EXPIRING', 'PLAN_EXPIRED',
      ],
      message: 'Invalid notification type',
    },
    default: 'info',
  },
  targetRole: {
    type: String,
    enum: ['admin', 'sub-admin', 'user', 'all'],
    default: 'all',
  },
  targetIds: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  // Whether this notification should also be visible to regular users
  userVisible: {
    type: Boolean,
    default: false,
  },
  // For push notifications
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Delivery tracking
  status: {
    type: String,
    enum: ['sent', 'delivered'],
    default: 'sent',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  // Read tracking per recipient (admin or user)
  readBy: [{
    readerId: { type: mongoose.Schema.Types.ObjectId },
    readerType: { type: String, enum: ['admin', 'user'], default: 'admin' },
    readAt: { type: Date, default: Date.now },
  }],
  // Push delivery tracking
  pushSent: {
    type: Boolean,
    default: false,
  },
  pushResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  deliveredByBackend: {
    type: Boolean,
    default: false,
  },
  deliveredByAdminBackend: {
    type: Boolean,
    default: false,
  },
  sendPush: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for fast unread queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ 'readBy.readerId': 1, 'readBy.readerType': 1 });
notificationSchema.index({ targetRole: 1, status: 1, createdAt: -1 });
// Speed up filtered lists and counts
notificationSchema.index({ userVisible: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1, createdAt: -1 });
notificationSchema.index({ status: 1, targetRole: 1 });
// Per-user targeted notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

// Helper: check if a reader has read this notification
notificationSchema.methods.isReadBy = function (readerId, readerType = 'admin') {
  return this.readBy.some(
    (r) => r.readerId.toString() === readerId.toString() && r.readerType === readerType
  );
};

// Static: get unread count for an admin
notificationSchema.statics.getUnreadCount = async function (adminId) {
  return this.countDocuments({
    status: { $in: ['sent', 'delivered'] },
    targetRole: { $in: ['admin', 'sub-admin', 'all'] },
    readBy: {
      $not: {
        $elemMatch: { readerId: adminId, readerType: 'admin' },
      },
    },
    $or: [
      { targetIds: { $in: [adminId] } },
      { targetIds: { $exists: false } },
      { targetIds: { $size: 0 } },
    ],
  });
};

// Static: get unread count for a user
notificationSchema.statics.getUserUnreadCount = async function (userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return this.countDocuments({
    status: { $in: ['sent', 'delivered'] },
    $and: [
      {
        $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }],
      },
      {
        $or: [
          { targetIds: { $in: [userObjectId] } },
          { targetIds: { $exists: false } },
          { targetIds: { $size: 0 } },
        ],
      },
    ],
    readBy: {
      $not: {
        $elemMatch: { readerId: userObjectId, readerType: 'user' },
      },
    },
  });
};

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;

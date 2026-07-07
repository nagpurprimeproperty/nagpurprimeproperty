import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Add this field to support targeted user notifications
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
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
      // Expanded enum to support backend notification types
      values: [
        'system', 'alert', 'info', 'success', 'warning', 
        'FIRST_PROPERTY', 'PLAN_PURCHASED', 'PLAN_EXPIRING', 'PLAN_EXPIRED'
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
  userVisible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['sent', 'delivered'],
    default: 'sent',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  readBy: [{
    readerId: { type: mongoose.Schema.Types.ObjectId },
    readerType: { type: String, enum: ['admin', 'user'], default: 'admin' },
    readAt: { type: Date, default: Date.now },
  }],
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
  // Add this field to align with the change stream logic
  deliveredByBackend: {
    type: Boolean,
    default: false,
  },
  deliveredByAdminBackend: {
    type: Boolean,
    default: false,
  },
  sendPush:{
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
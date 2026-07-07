// notification.service.js
import notificationRepository from './notification.repository.js';
import Notification from './notification.model.js';
import mongoose from 'mongoose';

// Lazy-import getIO to avoid circular dependency if socket isn't ready yet
const emitReadEvent = (userId, notificationId) => {
  try {
    // Dynamic import to handle cases where socket might not be initialised
    import('../../socket.js').then(({ getIO }) => {
      try {
        const io = getIO();
        const userRoom = userId.toString();
        io.to(userRoom).emit('notification_read', { notificationId: notificationId.toString() });

        // Update count
        Notification.countDocuments({
          userId,
          readBy: { $not: { $elemMatch: { readerId: userId, readerType: 'user' } } },
        }).then((count) => {
          io.to(userRoom).emit('notification_count', { count });
        }).catch(() => {});
      } catch {
        // Socket not ready — non-fatal
      }
    }).catch(() => {});
  } catch {
    // Non-fatal
  }
};

const notificationService = {
  getNotifications: async (userId, query) => {
    return notificationRepository.findAllForUser(userId, query);
  },

  getUserUnreadCount: async (userId) => {
    const count = await Notification.getUserUnreadCount(userId);
    return { count };
  },

  markOneRead: async (notificationId, userId) => {
    if (!mongoose.isValidObjectId(notificationId)) {
      throw Object.assign(new Error('Invalid notification ID'), { status: 400 });
    }

    const notifObjectId = new mongoose.Types.ObjectId(notificationId);
    const userObjectId  = new mongoose.Types.ObjectId(userId);

    const updated = await notificationRepository.markOneRead(notifObjectId, userObjectId);

    if (!updated) {
      return { alreadyRead: true };
    }

    // Emit socket event (non-blocking)
    emitReadEvent(userObjectId, notifObjectId);

    return { alreadyRead: false };
  },

  markAllRead: async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const modifiedCount = await notificationRepository.markAllRead(userObjectId);

    // Emit count reset (non-blocking)
    emitReadEvent(userObjectId, 'all');

    return { modifiedCount };
  },
};

export default notificationService;
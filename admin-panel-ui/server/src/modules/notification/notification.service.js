import Notification from '../../models/notification.model.js';
import pushService from '../../services/push.service.js';

const notificationService = {
  /** List all notifications (visible to admins) */
  list: async ({ adminId, status, type, page = 1, limit = 20, unreadOnly = false }) => {
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (unreadOnly && adminId) {
      query.targetRole = { $in: ['admin', 'sub-admin', 'all'] };
      query.readBy = {
        $not: {
          $elemMatch: { readerId: adminId, readerType: 'admin' },
        },
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    // Attach isRead flag for the requesting admin
    const enriched = items.map((n) => {
      const isAdminTarget = n.targetRole === 'admin' || n.targetRole === 'sub-admin' || n.targetRole === 'all';
      return {
        ...n,
        isRead: isAdminTarget
          ? (n.readBy?.some(
              (r) => r.readerId?.toString() === adminId?.toString() && r.readerType === 'admin'
            ) ?? false)
          : true, // Force true for user-only notifications so they don't style as unread
      };
    });

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /** List user-visible notifications */
  listForUser: async ({ userId, status, type, page = 1, limit = 20 }) => {
    const allowedStatuses = ['sent', 'delivered'];
    const effectiveStatus = status
      ? allowedStatuses.filter((s) => s === status)
      : allowedStatuses;
    const query = {
      $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }],
      status: { $in: effectiveStatus },
    };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const enriched = items.map((n) => ({
      ...n,
      isRead: n.readBy?.some(
        (r) => r.readerId?.toString() === userId?.toString() && r.readerType === 'user'
      ) ?? false,
    }));

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /** Get single notification by ID */
  getById: async (id) => {
    return Notification.findById(id).lean();
  },

  /** Create a new notification */
 create: async (data, { createdBy, sendPush = false }) => {
    const isUserTarget = data.targetRole === 'user' || data.targetRole === 'all';
    const doc = await Notification.create({
      ...data,
      createdBy: createdBy || null,
      sentAt: new Date(),
      sendPush: sendPush,
      userVisible: data.userVisible || isUserTarget,
      deliveredByAdminBackend: true, // Mark as delivered so watcher doesn't duplicate
    });

    const isAdminTarget = data.targetRole === 'admin' || data.targetRole === 'sub-admin' || data.targetRole === 'all';

    // Emit real-time socket event to admins
    if (isAdminTarget) {
      try {
        if (global._adminNsp) {
          global._adminNsp.emit('notification', {
            _id: String(doc._id),
            title: doc.title,
            message: doc.message,
            type: doc.type,
            status: doc.status,
            createdAt: doc.createdAt,
            pushSent: doc.pushSent,
            isRead: false,
          });
        }
      } catch (err) {
        console.error('Admin socket emit failed:', err.message);
      }
    }

    // Emit real-time socket event to users
    if (isUserTarget) {
      try {
        if (global._userNsp) {
          global._userNsp.emit('notification', {
            _id: String(doc._id),
            title: doc.title,
            message: doc.message,
            type: doc.type,
            status: doc.status,
            createdAt: doc.createdAt,
            isRead: false,
          });
        }
      } catch (err) {
        console.error('User socket emit failed:', err.message);
      }
    }

    // Optionally send FCM push
    if (sendPush && data.status === 'sent') {
      try {
        const pushData = {
          notificationId: String(doc._id),
          type: data.type || 'info',
          ...(data.data || {}),
        };

        const results = [];

        if (isAdminTarget) {
          const adminResult = await pushService.sendToTopic({
            topic: 'admin',
            title: data.title,
            body: data.message,
            data: pushData,
          });
          results.push(adminResult);
        }

        if (isUserTarget) {
          const userResult = await pushService.sendToTopic({
            topic: 'users',
            title: data.title,
            body: data.message,
            data: pushData,
          });
          results.push(userResult);
        }

        await Notification.updateOne(
          { _id: doc._id },
          { pushSent: true, pushResult: results }
        );
      } catch (err) {
        console.error('Push notification failed:', err.message);
      }
    }

    return doc.toObject();
  },

  /** Update a notification */
  update: async (id, data) => {
    const notification = await Notification.findById(id);
    if (!notification) throw { status: 404, message: 'Notification not found' };
    const allowed = ['title', 'message', 'type', 'status', 'data', 'targetRole', 'userVisible', 'targetIds'];
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowed.includes(key))
    );
    Object.assign(notification, sanitized);
    await notification.save();
    return notification.toObject();
  },

  /** Delete a notification */
  delete: async (id) => {
    const result = await Notification.findByIdAndDelete(id);
    if (!result) throw { status: 404, message: 'Notification not found' };
    return result;
  },

  /** Mark one or more notifications as read for an admin */
  markAsRead: async ({ adminId, notificationIds, markAll = false }) => {
    if (markAll) {
      // Direct updateMany — no pre-load of all unread IDs needed
      const result = await Notification.updateMany(
        {
          status: { $in: ['sent', 'delivered'] },
          targetRole: { $in: ['admin', 'sub-admin', 'all'] },
          'readBy.readerId': { $ne: adminId },
        },
        { $addToSet: { readBy: { readerId: adminId, readerType: 'admin', readAt: new Date() } } }
      );
      return { markedCount: result.modifiedCount };
    }

    if (!notificationIds?.length) {
      throw { status: 400, message: 'No notification IDs provided' };
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $addToSet: { readBy: { readerId: adminId, readerType: 'admin', readAt: new Date() } } }
    );
    return { markedCount: notificationIds.length };
  },

  /** Mark one or more notifications as read for a user */
  markAsReadForUser: async ({ userId, notificationIds, markAll = false }) => {
    if (markAll) {
      // Direct updateMany — no pre-load of all unread IDs needed
      const result = await Notification.updateMany(
        {
          status: { $in: ['sent', 'delivered'] },
          $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }],
          'readBy.readerId': { $ne: userId },
        },
        { $addToSet: { readBy: { readerId: userId, readerType: 'user', readAt: new Date() } } }
      );
      return { markedCount: result.modifiedCount };
    }

    if (!notificationIds?.length) {
      throw { status: 400, message: 'No notification IDs provided' };
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $addToSet: { readBy: { readerId: userId, readerType: 'user', readAt: new Date() } } }
    );
    return { markedCount: notificationIds.length };
  },

  /** Get unread count for an admin */
  getUnreadCount: async (adminId) => {
    return await Notification.countDocuments({
      status: { $in: ['sent', 'delivered'] },
      targetRole: { $in: ['admin', 'sub-admin', 'all'] },
      'readBy.readerId': { $ne: adminId },
    });
  },

  /** Get unread count for a user */
  getUserUnreadCount: async (userId) => {
    return await Notification.countDocuments({
      status: { $in: ['sent', 'delivered'] },
      $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }],
      'readBy.readerId': { $ne: userId },
    });
  },

  /** Get stats breakdown (admin-visible notifications) */
  getStats: async (adminId) => {
    const [total, sent, delivered, unread] = await Promise.all([
      Notification.countDocuments({}),
      Notification.countDocuments({ targetRole: { $in: ['admin', 'sub-admin', 'all'] } }),
      Notification.countDocuments({ targetRole: { $in: ['user', 'all'] } }),
      adminId ? notificationService.getUnreadCount(adminId) : Promise.resolve(0),
    ]);
    return { total, sent, delivered, unread: Number(unread) };
  },

  /** Send FCM push to specific tokens or topic */
  sendPush: async ({ title, message, topic, tokens, data = {} }) => {
    if (topic) {
      return pushService.sendToTopic({ topic, title, body: message, data });
    }
    if (tokens?.length) {
      return pushService.sendToMultiple({ tokens, title, body: message, data });
    }
    throw { status: 400, message: 'Either topic or tokens must be provided' };
  },
};

export default notificationService;

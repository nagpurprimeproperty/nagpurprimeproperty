// notification.controller.js
import notificationService from './notification.service.js';

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const result = await notificationService.getNotifications(
        req.user._id,
        req.query
      );
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const result = await notificationService.getUserUnreadCount(req.user._id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  markOneRead: async (req, res) => {
    try {
      const result = await notificationService.markOneRead(
        req.params.id,
        req.user._id
      );
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  markAllRead: async (req, res) => {
    try {
      const result = await notificationService.markAllRead(req.user._id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

export default notificationController;
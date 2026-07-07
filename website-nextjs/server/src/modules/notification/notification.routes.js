// notification.routes.js
import express from 'express';
import notificationController from './notification.controller.js';
import {attachUser} from "../../middlewares/attachUser.middleware.js";
import { userProtect } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.use(attachUser); // all routes require auth

router.get('/',                userProtect, notificationController.getNotifications);
router.get('/unread-count',    userProtect, notificationController.getUnreadCount);
router.patch('/read-all',      userProtect, notificationController.markAllRead);      // before /:id
router.patch('/:id/read',      userProtect, notificationController.markOneRead);

export default router;
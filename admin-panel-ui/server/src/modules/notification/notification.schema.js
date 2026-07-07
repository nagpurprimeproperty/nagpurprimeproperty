import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message cannot exceed 2000 characters'),
  type: z.enum(['system', 'alert', 'info', 'success', 'warning']).default('info'),
  targetRole: z.enum(['admin', 'sub-admin', 'user', 'all']).default('all'),
  userVisible: z.boolean().default(false),
  targetIds: z.array(z.string()).optional(),
  data: z.record(z.any()).optional(),
  status: z.enum(['sent', 'delivered']).default('sent'),
  sendPush: z.boolean().default(false),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  message: z.string().min(10).max(2000).optional(),
  type: z.enum(['system', 'alert', 'info', 'success', 'warning']).optional(),
  status: z.enum(['sent', 'delivered']).optional(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().default(false),
}).refine(
  (data) => (data.notificationIds && data.notificationIds.length > 0) || data.markAll === true,
  {
    message: 'Either notificationIds (non-empty array) or markAll must be true',
    path: ['notificationIds'],
  }
);

export const sendPushSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(2000),
  topic: z.string().optional(),
  tokens: z.array(z.string()).optional(),
  data: z.record(z.any()).optional(),
}).refine(
  (data) =>
    (data.tokens && data.tokens.length > 0) ||
    (data.topic && data.topic.trim().length > 0),
  {
    message: 'Either topic or at least one token is required',
    path: ['topic'],
  }
);

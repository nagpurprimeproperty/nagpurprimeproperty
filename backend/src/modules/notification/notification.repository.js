// notification.repository.js
import mongoose from 'mongoose';
import Notification from './notification.model.js';

const notificationRepository = {
  findAllForUser: async (userId, { page = 1, limit = 10 } = {}) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const userFilter = {
      $or: [
        { userId: userObjectId },
        {
          $and: [
            { $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }] },
            {
              $or: [
                { targetIds: { $in: [userObjectId] } },
                { targetIds: { $exists: false } },
                { targetIds: { $size: 0 } },
                { targetIds: null },
              ],
            },
          ],
        },
      ],
    };

    const unreadFilter = {
      readBy: { $not: { $elemMatch: { readerId: userObjectId, readerType: 'user' } } },
    };

    const [result] = await Notification.aggregate([
      { $match: userFilter },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: safeLimit },
            {
              $addFields: {
                isRead: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: { $ifNull: ['$readBy', []] },
                          as: 'r',
                          cond: {
                            $and: [
                              { $eq: ['$$r.readerId', userObjectId] },
                              { $eq: ['$$r.readerType', 'user'] },
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                createdAt: {
                  $toUpper: {
                    $dateToString: {
                      format: '%d %b',
                      date: { $ifNull: ['$createdAt', '$sentAt'] },
                    },
                  },
                }, // 25 MAR
              },
            },
            {
              $project: {
                pushResult: 0,
                createdBy: 0,
                pushSent: 0,
                readBy: 0,
                targetRole: 0,
                targetIds: 0,
                userVisible: 0,
                updatedAt: 0,
                __v: 0,
                status: 0,
                sentAt: 0,
              },
            },
          ],
          total: [{ $count: 'count' }],
          unreadCount: [{ $match: unreadFilter }, { $count: 'count' }],
        },
      },
    ]);

    return {
      data: result.data,
      total: result.total[0]?.count ?? 0,
      unreadCount: result.unreadCount[0]?.count ?? 0,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil((result.total[0]?.count ?? 0) / safeLimit) || 1,
    };
  },

  markOneRead: async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
      {
        _id: notificationId,
        readBy: { $not: { $elemMatch: { readerId: userId, readerType: 'user' } } },
      },
      { $push: { readBy: { readerId: userId, readerType: 'user', readAt: new Date() } } },
      { new: true }
    ).lean();
  },

  markAllRead: async (userId) => {
    const result = await Notification.updateMany(
      {
        $and: [
          { $or: [{ targetRole: { $in: ['user', 'all'] } }, { userVisible: true }] },
          {
            $or: [
              { targetIds: { $in: [userId] } },
              { targetIds: { $exists: false } },
              { targetIds: { $size: 0 } },
            ],
          },
        ],
        readBy: { $not: { $elemMatch: { readerId: userId, readerType: 'user' } } },
      },
      { $push: { readBy: { readerId: userId, readerType: 'user', readAt: new Date() } } }
    );

    return result.modifiedCount;
  },
};

export default notificationRepository;
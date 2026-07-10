import User from './user.model.js';
import mongoose from 'mongoose';

const userRepository = {
  /**
   * Create a new user
   */
  create: (payload, session) =>
    session
      ? User.create([payload], { session }).then((docs) => docs[0])
      : User.create(payload),

  /**
   * Find user by mobile
   */
  findByMobile: (mobile) => User.findOne({ mobile, isActive: true ,isDeleted: false}),

  /**
   * Find user by email
   */
  findByEmail: (email) => User.findOne({ email, isActive: true ,isDeleted: false}),

  /**
   * Find user by ID
   */
  findById: (id) => User.findOne({ _id: id, isActive: true ,isDeleted: false}).select('-fcmToken -__v'),

  /**
   * Find all users with server-side filtering and pagination
   * @param {Object} options
   * @param {string}  options.search   - Search across name, mobile, email, area, city
   * @param {string}  options.isActive - "all" | "active" | "inactive"
   * @param {number}  options.page     - 1-based page number
   * @param {number}  options.limit    - Items per page (max 100)
   * @returns {{ data, total, page, limit, totalPages }}
   */

  /**
   * Update a user by ID
   */
  updateById: (id, update) =>
    User.findOneAndUpdate({ _id: id, isActive: true, isDeleted: false }, { $set: update }, { new: true, runValidators: true }).select('-fcmToken -__v'),

  /**
   * Check if user exists by filter
   */
  exists: (filter) => User.exists({...filter, isActive: true, isDeleted: false }),

 getStats: async (userId) => {
    const stats = await User.aggregate([
      { $match: { _id: userId ? new mongoose.Types.ObjectId(userId) : { $exists: true }, isActive: true, isDeleted: false } },
      {
        $lookup: {
        from: 'properties',
        localField: '_id',
        foreignField: 'brokerId',
        as: 'properties',
      }
      },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'brokerId',
          as: 'leads',
        }
      },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'userId',
          as: 'enquiries',
        }
      },
      {
        $lookup: {
          from: 'savedproperties',
          localField: '_id',
          foreignField: 'userId',
          as: 'savedProperties',
        }
      },
      {
        $project: {
          name: 1,
          mobile: 1,
          email: 1,
          propertiesCount: { $size: '$properties' },
          leadsCount: { $size: '$leads' },
          enquiriesCount: { $size: '$enquiries' },
          savedPropertiesCount: { $size: '$savedProperties' },
        }
      },
      {
        $group: {
          _id: null,
          usersCount: { $sum: 1 },
          propertiesCount: { $sum: '$propertiesCount' },
          leadsCount: { $sum: '$leadsCount' },
          enquiriesCount: { $sum: '$enquiriesCount' },
          savedPropertiesCount: { $sum: '$savedPropertiesCount' },
        }
      },
      {
        $project: {
          usersCount: 1,
          propertiesCount: 1,
          leadsCount: 1,
          enquiriesCount: 1,
          savedPropertiesCount: 1,
        }
      }
    ]);

    const result = stats[0] || {};
    const formattedStats = {
      propertiesCount: result.propertiesCount || 0,
      leadsCount: result.leadsCount || 0,
      enquiriesCount: result.enquiriesCount || 0,
      savedPropertiesCount: result.savedPropertiesCount || 0,
    };
    return  formattedStats;
  },

  /**
   * Delete a user by ID
   */
  deleteById: (id) => User.findByIdAndDelete(id),
};

export default userRepository;

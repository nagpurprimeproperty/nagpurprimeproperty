import User from '../../models/user.model.js';
import { safeRegexFilter } from '../../utils/query-sanitizer.js';

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
  findByMobile: (mobile) => User.findOne({ mobile }),

  /**
   * Find user by email
   */
  findByEmail: (email) => User.findOne({ email }),

  /**
   * Find user by ID
   */
  findById: (id) => User.findById(id).select('-fcmToken'),

  /**
   * Find all users with server-side filtering and pagination
   * @param {Object} options
   * @param {string}  options.search   - Search across name, mobile, email, area, city
   * @param {string}  options.isActive - "all" | "active" | "inactive"
   * @param {number}  options.page     - 1-based page number
   * @param {number}  options.limit    - Items per page (max 100)
   * @returns {{ data, total, page, limit, totalPages }}
   */
  findAll: async ({ search, isActive, page = 1, limit = 10 } = {}) => {
    const filter = {};
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);

    if (search?.trim()) {
      const safe = safeRegexFilter(search.trim());
      if (!safe) {
        return { data: [], total: 0, page: safePage, limit: safeLimit, totalPages: 0 };
      }
      filter.$or = [
        { name: safe },
        { mobile: safe },
        { email: safe },
        { area: safe },
        { city: safe },
      ];
    }

    if (isActive && isActive !== 'all') {
      filter.isActive = isActive === 'active';
    }

    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      User.find(filter)
        .select('-fcmToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      User.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  },

  /**
   * Get aggregate stats for overview cards
   * Returns: { total, active, inactive, free, paid }
   */
  getStats: async () => {
    const result = await User.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $facet: {
          total: [
            { $count: 'count' }
          ],
          active: [
            { $match: { isActive: true } },
            { $count: 'count' }
          ],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
          active: { $ifNull: [{ $arrayElemAt: ['$active.count', 0] }, 0] },
        },
      },
      {
        $addFields: {
          inactive: { $subtract: ['$total', '$active'] },
        },
      },
    ]);

    return result[0] || { total: 0, active: 0, inactive: 0 };
  },
  /**
   * Update a user by ID
   */
  updateById: (id, update) =>
    User.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).select('-fcmToken'),

  /**
   * Delete a user by ID
   */
  deleteById: (id) => User.findByIdAndDelete(id),

  /**
   * Check if user exists by filter
   */
  exists: (filter) => User.exists(filter),
};

export default userRepository;

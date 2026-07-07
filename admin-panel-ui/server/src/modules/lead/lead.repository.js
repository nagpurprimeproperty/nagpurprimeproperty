import Lead from '../../models/leads.model.js';
import mongoose from 'mongoose';
import { safeRegexFilter } from '../../utils/query-sanitizer.js';

const leadRepository = {
  /**
   * Find lead by ID
   */
  findById: (id) => Lead.findById(id).populate('brokerId', 'name mobile email'),

  /**
   * Find all leads with server-side filtering and pagination
   * @param {Object} options
   * @param {string}  options.search      - Search across name, phone, notes
   * @param {string}  options.status      - 'all' | 'New' | 'Contacted' | 'Closed'
   * @param {string}  options.area        - Filter by locality
   * @param {string}  options.propertyType
   * @param {string}  options.dateFrom    - ISO date string
   * @param {string}  options.dateTo      - ISO date string
   * @param {number}  options.page        - 1-based page number
   * @param {number}  options.limit       - Items per page (max 100)
   */
  findAll: async ({ search, status, area, propertyType, dateFrom, dateTo, userId, brokerId, page = 1, limit = 10 } = {}) => {
    const filter = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    if (brokerId && mongoose.Types.ObjectId.isValid(brokerId)) {
      filter.brokerId = brokerId;
    }

    if (search?.trim()) {
      const safe = safeRegexFilter(search.trim());
      if (!safe) {
        return { data: [], total: 0, page: Math.max(Number(page) || 1, 1), limit: Math.min(Math.max(Number(limit) || 10, 1), 100), totalPages: 0 };
      }
      filter.$or = [
        { customerName: safe },
        { phone: safe },
        { notes: safe },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (area && area !== 'all') {
      filter.area = area;
    }

    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   filter.createdAt.$lte = new Date(dateTo);
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage  = Math.max(Number(page) || 1, 1);
    const skip      = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Lead.find(filter)
        .populate('brokerId', 'name mobile email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Lead.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page:       safePage,
      limit:      safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  },

/**
 * Get aggregate stats for overview cards
 */
getStats: async () => {
    const [result] = await Lead.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                new: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'New'] }, 1, 0],
                    },
                },
                contacted: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0],
                    },
                },
                closed: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0],
                    },
                },
            },
        },
        { $project: { _id: 0, total: 1, new: 1, contacted: 1, closed: 1 } },
    ]);

    return {
        total: result?.total ?? 0,
        new: result?.new ?? 0,
        contacted: result?.contacted ?? 0,
        closed: result?.closed ?? 0,
    };
},

  /**
   * Update a lead by ID
   */
  updateById: (id, update) =>
    Lead.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true })
      .populate('brokerId', 'name mobile email'),

  /**
   * Delete a lead by ID
   */
  deleteById: (id) => Lead.findByIdAndDelete(id),

  /**
   * Check if lead exists
   */
  exists: (filter) => Lead.exists(filter),
};

export default leadRepository;
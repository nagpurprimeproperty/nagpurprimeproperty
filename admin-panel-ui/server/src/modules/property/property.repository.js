import Property from '../../models/property.model.js';
import { safeRegexFilter } from '../../utils/query-sanitizer.js';

const propertyRepository = {
  /**
   * Create a new property
   */
  create: (payload) => Property.create(payload),

  /**
   * Find all properties with server-side filtering, search, and pagination.
   */
  findAll: async ({
    search,
    status,
    listingCategory,
    propertyType,
    locality,
    brokerId,
    featured,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
  } = {}) => {
    const filter = {};

    // Use regex for partial/prefix matching on title and location fields.
    // $text was avoided because it only matches whole words, not substrings.
    if (search?.trim()) {
      const rx = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { title: rx },
        { 'location.locality': rx },
        { 'location.city': rx },
      ];
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (listingCategory && listingCategory !== 'all') {
      filter.listingCategory = listingCategory;
    }
    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType;
    }
    if (locality && locality !== 'all') {
      filter['location.locality'] = locality;
    }
    if (brokerId) {
      filter.brokerId = brokerId;
    }
    if (featured === 'true' || featured === true) {
      filter.featured = true;
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Property.find(filter)
        .populate('brokerId', 'name mobile email city area avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Property.countDocuments(filter),
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
   * Find property by ID, populated with broker info.
   * FIX: use .lean() so service gets a plain object (safe to spread/mutate for media formatting)
   */
  findById: (id) =>
    Property.findById(id)
      .populate('brokerId', 'name mobile email city area avatar')
      .lean(),

  /**
   * Find by ID without populate (raw mongoose doc, for mutations)
   */
  findByIdRaw: (id) => Property.findById(id),

  /**
   * Update property — returns populated plain object via lean
   */
  updateById: (id, update, options = { new: true }) =>
    Property.findByIdAndUpdate(id, update, { ...options, runValidators: true })
      .populate('brokerId', 'name mobile email city area avatar')
      .lean(),

  /**
   * Delete property
   */
  deleteById: (id) => Property.findByIdAndDelete(id),

  /**
   * Aggregate admin-facing stats.
   * FIX: only query statuses that exist in PROPERTY_STATUSES constant.
   *      Removed 'Draft' (not in schema). 'Pending' and 'Rented' added to constants.
   */
  getStats: async () => {
    const [stats] = await Property.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Active'] }, 1, 0],
            },
          },
          featured: {
            $sum: {
              $cond: [{ $eq: ['$featured', true] }, 1, 0],
            },
          },
          sold: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Sold'] }, 1, 0],
            },
          },
          inactive: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          featured: 1,
          sold: 1,
          inactive: 1,
        },
      },
    ]);

    return stats || {
      total: 0,
      active: 0,
      featured: 0,
      sold: 0,
      inactive: 0,
    };
  },

  incrementViews: (id) =>
    Property.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }),

  incrementInquiries: (id) =>
    Property.findByIdAndUpdate(id, { $inc: { inquiries: 1 } }, { new: true }),

  countByBroker: (brokerId) => Property.countDocuments({ brokerId }),

  /**
   * Distinct localities from properties (for lead/property filter dropdowns).
   * @param {Object} options
   * @param {string} [options.status] - e.g. 'Active' for available listings only
   */
  getDistinctLocalities: async ({ status } = {}) => {
    const filter = {
      'location.locality': { $exists: true, $nin: [null, ''] },
    };
    if (status) filter.status = status;

    const localities = await Property.distinct('location.locality', filter);
    return localities
      .map((l) => (typeof l === 'string' ? l.trim() : l))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  },
};

export default propertyRepository;
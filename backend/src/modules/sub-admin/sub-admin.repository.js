import Admin from '../../models/admin.model.js';

const subAdminRepository = {
  /**
   * Create a new sub-admin
   */
  create: async (adminData) => {
    return Admin.create({ ...adminData, role: 'sub-admin' });
  },

  /**
   * Find sub-admin by email
   */
  findByEmail: async (email) => {
    return Admin.findOne({ email });
  },

  /**
   * Find all sub-admins with optional server-side filtering and pagination
   * @param {Object} options
   * @param {string}  options.search     - Search across firstName, lastName, email
   * @param {string}  options.status     - "all" | "active" | "inactive"
   * @param {number}  options.page       - 1-based page number (default: 1)
   * @param {number}  options.limit      - Items per page (default: 10, max: 100)
   * @returns {{ data, total, page, limit, totalPages }}
   */
  findAll: async ({ search, status, page = 1, limit = 10 } = {}) => {
    const filter = { role: 'sub-admin' };

    if (search && search.trim()) {
      filter.$or = [
        { firstName: { $regex: search.trim(), $options: 'i' } },
        { lastName:  { $regex: search.trim(), $options: 'i' } },
        { email:     { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage  = Math.max(Number(page)  || 1,  1);
    const skip      = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Admin.find(filter)
        .select('-password -otp -otpToken -otpExpiry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Admin.countDocuments(filter),
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
   * Aggregate stats for the sub-admin overview cards
   * Returns: { total, active, inactive }
   */
  getStats: async () => {
    const [total, active] = await Promise.all([
      Admin.countDocuments({ role: 'sub-admin' }),
      Admin.countDocuments({ role: 'sub-admin', isActive: true }),
    ]);
    return { total, active, inactive: total - active };
  },

  /**
   * Find a single sub-admin by ID (safe projection — no sensitive fields)
   */
  findById: async (subAdminId) => {
    return Admin.findOne({ _id: subAdminId, role: 'sub-admin' })
      .select('-password -otp -otpToken -otpExpiry');
  },

  /**
   * Find a single sub-admin by ID (raw — for mutations that need the full document)
   */
  findByIdRaw: async (subAdminId) => {
    return Admin.findOne({ _id: subAdminId, role: 'sub-admin' });
  },

  /**
   * Toggle isActive and persist
   */
  toggleStatus: async (subAdmin) => {
    subAdmin.isActive = !subAdmin.isActive;
    return subAdmin.save();
  },

  /**
   * Permanently delete a sub-admin document
   */
  deleteById: async (subAdminId) => {
    return Admin.findByIdAndDelete(subAdminId);
  },
};

export default subAdminRepository;
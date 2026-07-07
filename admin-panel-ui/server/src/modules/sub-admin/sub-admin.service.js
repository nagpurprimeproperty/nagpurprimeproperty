import subAdminRepository from './sub-admin.repository.js';
import permissionRepository from './permission.repository.js';

const subAdminService = {
  /**
   * Create a new sub-admin and optionally assign initial permissions
   */
  createSubAdmin: async (adminData, modulePermissions = []) => {
    const existing = await subAdminRepository.findByEmail(adminData.email);
    if (existing) throw { status: 409, message: 'Email already in use' };

    const subAdmin = await subAdminRepository.create(adminData);

    if (modulePermissions?.length > 0) {
      await permissionRepository.replaceAll(subAdmin._id, modulePermissions);
    }

    return subAdmin;
  },

  /**
   * List sub-admins with server-side filtering and pagination.
   * Each record is hydrated with its permission array.
   *
   * Returns: { data, total, page, limit, totalPages }
   */
  listSubAdmins: async ({ search, status, page, limit } = {}) => {
    const result = await subAdminRepository.findAll({ search, status, page, limit });

    // Batch load all permissions at once to avoid N+1 queries
    const adminIds = result.data.map(sa => sa._id);
    const allPermissions = await permissionRepository.findAllByAdminIds(adminIds);
    
    // Group permissions by adminId for easy lookup
    const permissionsByAdmin = allPermissions.reduce((acc, permission) => {
      if (!acc[permission.adminId]) {
        acc[permission.adminId] = [];
      }
      acc[permission.adminId].push(permission);
      return acc;
    }, {});

    // Hydrate each sub-admin with their permission records
    // result.data is already a plain object (lean)
    const hydrated = result.data.map(sa => ({
      ...sa,
      permissions: permissionsByAdmin[sa._id] || []
    }));

    return {
      data:       hydrated,
      total:      result.total,
      page:       result.page,
      limit:      result.limit,
      totalPages: result.totalPages,
    };
  },

  /**
   * Return aggregate counts for the stats cards
   */
  getStats: async () => {
    return subAdminRepository.getStats();
  },

  /**
   * Fetch a single sub-admin with their permissions
   */
  getSubAdmin: async (subAdminId) => {
    const subAdmin = await subAdminRepository.findById(subAdminId);
    if (!subAdmin) throw { status: 404, message: 'Sub-admin not found' };

    const permissions = await permissionRepository.findAllByAdminId(subAdminId);
    return { ...subAdmin.toObject(), permissions };
  },

  /**
   * Replace ALL permission records for a sub-admin
   */
  updatePermissions: async (subAdminId, modulePermissions = []) => {
    const subAdmin = await subAdminRepository.findByIdRaw(subAdminId);
    if (!subAdmin) throw { status: 404, message: 'Sub-admin not found' };

    await permissionRepository.replaceAll(subAdminId, modulePermissions);
    return permissionRepository.findAllByAdminId(subAdminId);
  },

  /**
   * Toggle active / inactive status
   */
  toggleStatus: async (subAdminId) => {
    const subAdmin = await subAdminRepository.findByIdRaw(subAdminId);
    if (!subAdmin) throw { status: 404, message: 'Sub-admin not found' };

    return subAdminRepository.toggleStatus(subAdmin);
  },

  /**
   * Delete a sub-admin and all their permission records
   */
  deleteSubAdmin: async (subAdminId) => {
    const subAdmin = await subAdminRepository.findByIdRaw(subAdminId);
    if (!subAdmin) throw { status: 404, message: 'Sub-admin not found' };

    await permissionRepository.deleteAllByAdminId(subAdminId);
    await subAdminRepository.deleteById(subAdminId);
  },

  /**
   * Build a flat permissions map used during login token generation.
   * Returns: { [module]: { read, write, delete } }
   * Returns null / empty for full admins (caller decides).
   */
  getPermissionsMap: async (adminId) => {
    const records = await permissionRepository.findAllByAdminId(adminId);
    return records.reduce((map, record) => {
      map[record.module] = {
        read:   record.permissions.read,
        write:  record.permissions.write,
        delete: record.permissions.delete,
      };
      return map;
    }, {});
  },
};

export default subAdminService;
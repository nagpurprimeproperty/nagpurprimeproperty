import Permission from '../../models/permission.model.js';

/**
 * Permission Repository
 * All DB access for the Permission collection lives here.
 */
const permissionRepository = {
  /**
   * Get all permission records for a given admin (sub-admin).
   * Returns an array of permission documents.
   */
  findAllByAdminId: (adminId) =>
    Permission.find({ adminId }),

  /**
   * Get a single permission record for (adminId, module).
   */
  findByAdminAndModule: (adminId, module) =>
    Permission.findOne({ adminId, module }),

  /**
   * Upsert a permission record for (adminId, module).
   * Creates if not exists, updates otherwise.
   */
  upsertPermission: (adminId, module, permissions) =>
    Permission.findOneAndUpdate(
      { adminId, module },
      { $set: { permissions } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),

  /**
   * Replace ALL permissions for a sub-admin.
   * - Deletes existing records
   * - Inserts fresh records from the provided array
   *
   * @param {string} adminId
   * @param {Array<{ module: string, permissions: { read, write, delete } }>} modulePermissions
   */
  replaceAll: async (adminId, modulePermissions) => {
    await Permission.deleteMany({ adminId });

    if (!modulePermissions || modulePermissions.length === 0) return [];

    const docs = modulePermissions.map(({ module, permissions }) => ({
      adminId,
      module,
      permissions: {
        read:   permissions?.read   ?? false,
        write:  permissions?.write  ?? false,
        delete: permissions?.delete ?? false,
      },
    }));

    return Permission.insertMany(docs);
  },

  /**
   * Delete ALL permissions for a sub-admin (used when deleting the sub-admin).
   */
  deleteAllByAdminId: (adminId) =>
    Permission.deleteMany({ adminId }),

  /**
   * Get all permissions for multiple admin IDs at once
   * Returns: Array<Permission> — flat array of permission documents matching provided adminIds
   */
  findAllByAdminIds: (adminIds) =>
    Permission.find({ adminId: { $in: adminIds } }),
};

export default permissionRepository;
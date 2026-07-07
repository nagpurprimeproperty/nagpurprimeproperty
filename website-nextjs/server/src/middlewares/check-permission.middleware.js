import permissionRepository from '../modules/sub-admin/permission.repository.js';

/**
 * METHOD → REQUIRED PERMISSION mapping
 */
const METHOD_PERMISSION = {
  GET:    'read',
  POST:   'write',
  PUT:    'write',
  PATCH:  'write',
  DELETE: 'delete',
};

/**
 * checkPermission(module)
 *
 * Middleware factory. Returns an Express middleware that:
 *  1. Confirms the user is authenticated (req.user must be set by authMiddleware)
 *  2. If role === "admin" → passes through unconditionally
 *  3. If role === "sub-admin":
 *       - Fetches the Permission record for (adminId, module)
 *       - Maps request method → required permission (read / write / delete)
 *       - Allows or rejects with 403
 *
 * Usage:
 *   router.get('/', authMiddleware, checkPermission('brokers'), listBrokers)
 *
 * @param {string} moduleName - must match a value in the Permission model enum
 */
const checkPermission = (moduleName) => async (req, res, next) => {
  try {
    const user = req.user;

    // Auth middleware must have run first
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Full admin — always allowed
    if (user.role === 'admin') {
      return next();
    }

    // Sub-admin — check permission document
    if (user.role === 'sub-admin') {
      // Inactive sub-admin cannot do anything
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact the administrator.',
        });
      }

      const requiredPermission = METHOD_PERMISSION[req.method?.toUpperCase()];

      if (!requiredPermission) {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      const record = await permissionRepository.findByAdminAndModule(user.id, moduleName);

      if (!record || !record.permissions[requiredPermission]) {
        return res.status(403).json({
          success: false,
          message: `You do not have ${requiredPermission} access to the "${moduleName}" module.`,
        });
      }

      return next();
    }

    // Unknown role
    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (err) {
    next(err);
  }
};

export default checkPermission;
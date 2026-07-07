import AuditLog from '../../models/auditLog.model.js';

const auditService = {
  /**
   * Log an admin action.
   */
  log: async ({ action, module, actorId, actorRole, resourceId, metadata, ip, userAgent, required = false }) => {
    if (actorId === null || actorId === undefined || typeof actorRole !== 'string' || !actorRole.trim() || typeof action !== 'string' || !action.trim() || typeof module !== 'string' || !module.trim()) {
      console.error('Audit log validation failed: missing required fields');
      return;
    }
    const MAX_UA = 512;
    const safeUserAgent = typeof userAgent === 'string' && userAgent.length > MAX_UA ? userAgent.slice(0, MAX_UA) : userAgent;
    try {
      await AuditLog.create({
        actorId,
        actorRole,
        action: action.toUpperCase(),
        module: module.toLowerCase(),
        resourceId: resourceId ? String(resourceId) : undefined,
        metadata: metadata || {},
        ip: typeof ip === 'string' ? ip : undefined,
        userAgent: safeUserAgent,
      });
      return { success: true };
    } catch (err) {
      console.error('Audit log error:', err);
      
      // For required operations, rethrow to fail parent operation
      if (required) {
        throw new Error(`Critical audit log failed: ${err.message}`);
      }
      
      // Log failure but don't throw to prevent parent API operation from failing
      return { success: false, error: `Audit log failed: ${err.message}` };
    }
  },

  /**
   * List audit logs with pagination.
   */
  listLogs: async ({ caller, module, action, actorId, page = 1, limit = 50 } = {}) => {
    if (!caller || !caller.role) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    const filter = {};
    if (module && typeof module === 'string') filter.module = module.toLowerCase();
    if (action && typeof action === 'string') filter.action = action.toUpperCase();
    if (actorId !== null && actorId !== undefined) filter.actorId = actorId;

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) || 1 };
  },
};

export default auditService;

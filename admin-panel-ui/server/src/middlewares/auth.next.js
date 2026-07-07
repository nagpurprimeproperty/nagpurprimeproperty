import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Next.js-compatible auth helpers.
 * These replace Express middleware chaining — call them inline in each route handler.
 */

// ─── Read & verify JWT ────────────────────────────────────────────────────────

/**
 * Extract and verify the Bearer token from the request.
 * @param {import('next/server').NextRequest} req
 * @returns {{ id: string; role: string; isActive: boolean } | null}
 */
export function getAuthUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return /** @type {any} */ (jwt.verify(token, process.env.JWT_SECRET));
  } catch {
    return null;
  }
}

// ─── Guard helpers (return NextResponse on failure, null on success) ──────────

/**
 * Require a valid JWT. Returns { user } or a NextResponse 401.
 * @param {import('next/server').NextRequest} req
 * @returns {{ user: { id: string; role: string; isActive: boolean } } | NextResponse}
 */
export function requireAuth(req) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }
  return { user };
}

/**
 * Require one of the listed roles. Returns NextResponse 403 or null.
 * @param {{ id: string; role: string; isActive: boolean }} user
 * @param {string[]} roles
 * @returns {NextResponse | null}
 */
export function requireRole(user, roles) {
  if (roles.length && !roles.includes(user.role)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
  }
  return null;
}

// ─── Permission check (replaces checkPermission middleware) ───────────────────

const METHOD_PERMISSION = {
  GET:    'read',
  POST:   'write',
  PUT:    'write',
  PATCH:  'write',
  DELETE: 'delete',
};

/** Cache TTL for permission records (seconds) */
const PERM_CACHE_TTL = 60;

/**
 * Retrieve a permission record with Redis caching (60-second TTL).
 * Falls back to a direct DB query if Redis is unavailable.
 *
 * @param {any} permissionRepository
 * @param {string} userId
 * @param {string} moduleName
 */
async function getCachedPermission(permissionRepository, userId, moduleName) {
  const cacheKey = `perm:${userId}:${moduleName}`;

  // Lazy-import to avoid issues during build
  let redis;
  try {
    const { getRedis } = await import('../config/redis.js');
    redis = getRedis();
  } catch {
    // Redis unavailable — fall through to DB
  }

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached !== null) {
        return cached === 'null' ? null : JSON.parse(cached);
      }
    } catch (err) {
      console.warn(`[auth] Redis permission cache read failed (key=${cacheKey}):`, err?.message);
    }
  }

  // Cache miss — fetch from DB
  const record = await permissionRepository.findByAdminAndModule(userId, moduleName);

  if (redis) {
    try {
      const value = record === null ? 'null' : JSON.stringify(record);
      await redis.setex(cacheKey, PERM_CACHE_TTL, value);
    } catch (err) {
      console.warn(`[auth] Redis permission cache write failed (key=${cacheKey}):`, err?.message);
    }
  }

  return record;
}

/**
 * Check module permission for sub-admins. Full admins always pass.
 * Returns NextResponse on failure, null on success.
 *
 * @param {{ id: string; role: string; isActive: boolean }} user
 * @param {string} method  HTTP method string (e.g. 'GET')
 * @param {string} moduleName  Permission module name (e.g. 'properties')
 * @returns {Promise<NextResponse | null>}
 */
export async function requirePermission(user, method, moduleName) {
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Full admin — always allowed
  if (user.role === 'admin') return null;

  // Sub-admin checks
  if (user.role === 'sub-admin') {
    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Contact the administrator.' },
        { status: 403 }
      );
    }

    const requiredPermission = METHOD_PERMISSION[method?.toUpperCase()];
    if (!requiredPermission) {
      return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
    }

    // Lazy-import to avoid issues during build
    const { default: permissionRepository } = await import(
      '../modules/sub-admin/permission.repository.js'
    );

    // Use cached lookup (Redis, 60s TTL) instead of a raw DB query on every request
    const record = await getCachedPermission(permissionRepository, user.id, moduleName);

    if (!record || !record.permissions[requiredPermission]) {
      return NextResponse.json(
        {
          success: false,
          message: `You do not have ${requiredPermission} access to the "${moduleName}" module.`,
        },
        { status: 403 }
      );
    }

    return null;
  }

  return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
}

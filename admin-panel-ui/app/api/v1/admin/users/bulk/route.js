import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import userService from '@/server/src/modules/user/user.service.js';
import auditService from '@/server/src/modules/audit/audit.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const MAX_BATCH_SIZE = 100;

export async function PATCH(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'ids array is required' }, { status: 400 });
    }

    if (ids.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ success: false, message: `Batch too large. Max ${MAX_BATCH_SIZE} allowed.` }, { status: 413 });
    }

    if (!ids.every((id) => id != null && (typeof id === 'number' || (typeof id === 'string' && id.trim().length > 0)))) {
      return NextResponse.json({ success: false, message: 'All ids must be non-empty strings or numbers' }, { status: 400 });
    }

    if (!['status', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action. Use status or delete' }, { status: 400 });
    }

    const results = { succeeded: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        if (action === 'status') {
          await userService.setStatus(id, body.enabled);
        } else if (action === 'delete') {
          await userService.deleteUser(id);
        }
        results.succeeded += 1;
        await auditService.log({
          actorId: auth.user?._id || auth.user?.id,
          actorRole: auth.user?.role || 'admin',
          action: action === 'delete' ? 'DELETE' : 'UPDATE',
          module: 'users',
          resourceId: id,
          metadata: { bulk: true, action, enabled: body.enabled },
          ip: req.headers.get('x-forwarded-for') || req.ip,
          userAgent: req.headers.get('user-agent'),
        });
      } catch (err) {
        results.failed += 1;
        results.errors.push({ id, message: err.message || 'Unknown error' });
        await auditService.log({
          actorId: auth.user?._id || auth.user?.id,
          actorRole: auth.user?.role || 'admin',
          action: action === 'delete' ? 'DELETE' : 'UPDATE',
          module: 'users',
          resourceId: id,
          metadata: { bulk: true, action, error: err.message },
          ip: req.headers.get('x-forwarded-for') || req.ip,
          userAgent: req.headers.get('user-agent'),
        });
      }
    }

    if (results.succeeded === 0) {
      return NextResponse.json({ success: false, message: 'All operations failed', ...results }, { status: 400 });
    }
    if (results.failed > 0) {
      return NextResponse.json({ success: true, message: 'Partial success', ...results }, { status: 207 });
    }
    return NextResponse.json(successResponse(results, 'Bulk operation completed'));
  } catch (err) {
    return handleApiError(err);
  }
}

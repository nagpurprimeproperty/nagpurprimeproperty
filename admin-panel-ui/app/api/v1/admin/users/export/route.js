import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import User from '@/server/src/models/user.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

function escapeCsv(val) {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvHeader(includeSensitive) {
  const base = ['id','name','isActive','createdAt'];
  if (includeSensitive) base.push('mobile','email','city','area');
  return base.join(',');
}

function csvRow(u, includeSensitive) {
  const cols = [String(u._id), u.name || '', u.isActive ? 'Yes' : 'No', u.createdAt ? new Date(u.createdAt).toISOString() : ''];
  if (includeSensitive) {
    const mobile = u.mobile || '';
    const email = u.email || '';
    cols.push(mobile, email, u.city || '', u.area || '');
  }
  return cols.map(escapeCsv).join(',');
}

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    const isSuperAdmin = auth.user?.role === 'superadmin';
    await connectDB();
    const cursor = User.find().select('-fcmToken -password').maxTimeMS(60_000).batchSize(500).lean().cursor();

    const chunks = [csvHeader(isSuperAdmin)];
    let count = 0;
    for await (const u of cursor) {
      chunks.push(csvRow(u, isSuperAdmin));
      count++;
    }

    // Audit log
    try {
      const forwarded = req.headers.get('x-forwarded-for');
      const clientIp = req.ip;
      const AuditLog = (await import('@/server/src/models/auditLog.model.js')).default;
      await AuditLog.create({
        actorId: auth.user?._id || auth.user?.id,
        actorRole: auth.user?.role || 'admin',
        action: 'EXPORT_USERS_PII',
        module: 'users',
        resourceId: 'bulk',
        metadata: { recordCount: count, clientIp, forwardedFor: forwarded },
      });
    } catch {
      // Non-blocking
    }

    const csv = chunks.join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="users.csv"',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

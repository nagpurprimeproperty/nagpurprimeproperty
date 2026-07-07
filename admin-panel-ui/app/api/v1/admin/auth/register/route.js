import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Admin from '@/server/src/models/admin.model.js';
import { adminRegisterSchema } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';

export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const body = await req.json();

    const parsed = adminRegisterSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await Admin.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    const admin = await Admin.create({ ...parsed.data, role: 'admin' });

    // Audit log (non-blocking)
    try {
      const auditService = (await import('@/server/src/modules/audit/audit.service.js')).default;
      await auditService.log({
        actorId: auth.user?._id || auth.user?.id,
        actorRole: auth.user?.role || 'admin',
        action: 'ADMIN_CREATED',
        module: 'auth',
        resourceId: admin._id,
        metadata: { email: admin.email, firstName: admin.firstName, lastName: admin.lastName },
        ip: req.headers.get('x-forwarded-for') || req.ip,
        userAgent: req.headers.get('user-agent'),
      });
    } catch {
      // ignore
    }

    return NextResponse.json(
      successResponse(
        {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
        },
        'Admin registered successfully'
      ),
      { status: 201 }
    );
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }
    return handleApiError(err);
  }
}

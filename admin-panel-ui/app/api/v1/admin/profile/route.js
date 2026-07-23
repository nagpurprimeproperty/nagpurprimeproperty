import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { adminUpdateSchema, adminUpdatePassword } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/profile */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const data = await AdminService.getProfile(auth.user.id);
    return NextResponse.json(successResponse(data));
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/profile — multipart (avatar optional) */
export async function PUT(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const contentType = req.headers.get('content-type') || '';
    let body = {};
    let fileObj = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const avatarFile = formData.get('avatar');

      // Collect remaining text fields into body object
      for (const [key, value] of formData.entries()) {
        if (key !== 'avatar') body[key] = value;
      }

      // Convert File → multer-style object if present
      if (avatarFile && typeof avatarFile === 'object') {
        fileObj = {
          buffer: Buffer.from(await avatarFile.arrayBuffer()),
          originalname: avatarFile.name,
          mimetype: avatarFile.type,
        };
      }
    } else {
      body = await req.json();
    }

    const parsed = adminUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const data = await AdminService.updateProfile(auth.user.id, parsed.data, fileObj);
    return NextResponse.json(successResponse(data, 'Profile updated'));
  } catch (err) {
    return handleApiError(err);
  }
}

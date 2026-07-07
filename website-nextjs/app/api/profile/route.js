import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function GET(req) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userProfile = await UserService.getUser(user.id);
    return NextResponse.json({ success: true, data: userProfile });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Error fetching profile' }, { status: err.status || 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let payload = {};
    let fileArg = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      payload = {
        name: formData.get('name') || undefined,
        email: formData.get('email') || undefined,
        area: formData.get('area') || undefined,
        address: formData.get('address') || undefined,
      };

      const webFile = formData.get('avatar');
      if (webFile && typeof webFile === 'object' && webFile.name) {
        fileArg = {
          originalname: webFile.name,
          mimetype: webFile.type,
          buffer: Buffer.from(await webFile.arrayBuffer()),
        };
      }
    } else {
      payload = await req.json().catch(() => ({}));
    }

    const updatedUser = await UserService.updateUser(user.id, payload, fileArg);
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Error updating profile' }, { status: err.status || 500 });
  }
}

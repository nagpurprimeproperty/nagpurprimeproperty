import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';
import jwt from 'jsonwebtoken';

/** GET /api/v1/user/notifications — list user notifications */
export async function GET(req) {
  try {
    // Validate JWT_SECRET at runtime
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not configured');
      return NextResponse.json({ 
        success: false, 
        message: 'Server configuration error' 
      }, { status: 500 });
    }
    
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    const result = await notificationService.listForUser({ userId, status, type, page, limit });
    return NextResponse.json(successResponse(result, 'User notifications fetched'));
  } catch (err) {
    return handleApiError(err);
  }
}

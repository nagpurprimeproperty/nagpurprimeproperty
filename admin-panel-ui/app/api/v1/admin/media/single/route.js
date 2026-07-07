import { NextResponse } from 'next/server';
import storageService from '@/server/src/services/storage.service.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/v1/admin/media/single
 * Upload a single image (blog cover, area banner, author avatar, etc.)
 * Accepts multipart/form-data with field: file — File (one image)
 * Returns: { url: string }
 */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file !== 'object') {
      return NextResponse.json(
        { success: false, message: 'No file provided. Send a single image as the "file" field.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: `File exceeds 10 MB limit.` },
        { status: 400 }
      );
    }

    const buffer = {
      buffer: Buffer.from(await file.arrayBuffer()),
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
    };

    const result = await storageService.upload(buffer, 'blog-media');

    return NextResponse.json(
      { success: true, data: { url: result.url }, message: 'Image uploaded successfully' },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

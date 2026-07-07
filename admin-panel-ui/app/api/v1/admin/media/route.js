import { NextResponse } from 'next/server';
import storageService from '@/server/src/services/storage.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * POST /api/v1/admin/media
 * Upload one or more property media files (images + optional video).
 * Accepts multipart/form-data with fields:
 *   photos  — File[] (up to 15 images)
 *   video   — File   (optional, single video)
 *
 * Returns: { photos: string[], video: string | null }
 */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();

    const photoFiles = formData.getAll('photos').filter((f) => typeof f === 'object');
    const videoFile  = formData.get('video');

    // ── Validate counts ────────────────────────────────────────────────────
    if (photoFiles.length === 0 && !videoFile) {
      return NextResponse.json(
        { success: false, message: 'No files provided. Send at least one photo or a video.' },
        { status: 400 }
      );
    }

    if (photoFiles.length > 15) {
      return NextResponse.json(
        { success: false, message: 'Maximum 15 photos allowed per upload batch.' },
        { status: 400 }
      );
    }

    // ── Validate images ────────────────────────────────────────────────────
    for (const file of photoFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid image type "${file.type}". Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, message: `Image "${file.name}" exceeds 10 MB limit.` },
          { status: 400 }
        );
      }
    }

    // ── Validate video ─────────────────────────────────────────────────────
    if (videoFile && typeof videoFile === 'object') {
      if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid video type "${videoFile.type}". Allowed: MP4, MOV, AVI, WebM.` },
          { status: 400 }
        );
      }
      if (videoFile.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Video exceeds 100 MB limit.' },
          { status: 400 }
        );
      }
    }

    // ── Convert Web Files → buffer objects ────────────────────────────────
    const photoBuffers = await Promise.all(
      photoFiles.map(async (f) => ({
        buffer:       Buffer.from(await f.arrayBuffer()),
        originalname: f.name,
        mimetype:     f.type,
        size:         f.size,
      }))
    );

    let videoBuffer = null;
    if (videoFile && typeof videoFile === 'object') {
      videoBuffer = {
        buffer:       Buffer.from(await videoFile.arrayBuffer()),
        originalname: videoFile.name,
        mimetype:     videoFile.type,
        size:         videoFile.size,
      };
    }

    // ── Upload to S3 in parallel ───────────────────────────────────────────
    const [photoUploads, videoUpload] = await Promise.all([
      photoBuffers.length > 0
        ? Promise.all(photoBuffers.map((f) => storageService.upload(f, 'properties')))
        : Promise.resolve([]),
      videoBuffer
        ? storageService.upload(videoBuffer, 'properties/videos')
        : Promise.resolve(null),
    ]);

    return NextResponse.json(
      successResponse(
        {
          photos: photoUploads.map((u) => u.url),
          video:  videoUpload ? videoUpload.url : null,
        },
        'Media uploaded successfully'
      ),
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/v1/admin/media
 * Delete one or more media files from S3.
 * Body: { urls: string[] }
 */
export async function DELETE(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => ({}));
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provide a non-empty "urls" array.' },
        { status: 400 }
      );
    }

    // Best-effort: delete all, collect results
    const results = await Promise.allSettled(
      urls.map((url) => storageService.delete(url))
    );

    const failed = results
      .map((r, i) => (r.status === 'rejected' ? urls[i] : null))
      .filter(Boolean);

    if (failed.length > 0) {
      console.warn('[media/delete] Failed to delete:', failed);
    }

    return NextResponse.json(
      successResponse(
        { deleted: urls.length - failed.length, failed },
        failed.length === 0
          ? 'All files deleted successfully'
          : `${urls.length - failed.length} of ${urls.length} files deleted`
      )
    );
  } catch (err) {
    return handleApiError(err);
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

export async function PATCH(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { ids, action, status, featured } = await req.json();

    const MAX_IDS = 500;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'ids array is required' }, { status: 400 });
    }
    if (ids.length > MAX_IDS) {
      return NextResponse.json({ success: false, message: `Too many IDs. Max ${MAX_IDS} allowed.` }, { status: 413 });
    }

    if (!['status', 'featured', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action. Use status, featured, or delete' }, { status: 400 });
    }

    if (action === 'status' && (typeof status !== 'string' || !status.trim())) {
      return NextResponse.json({ success: false, message: 'status is required for action=status' }, { status: 400 });
    }

    if (action === 'featured' && typeof featured !== 'boolean') {
      return NextResponse.json({ success: false, message: 'featured boolean is required for action=featured' }, { status: 400 });
    }

    const results = { succeeded: 0, failed: 0, errors: [], skipped: [] };
    const TIMEOUT_MS = 10_000;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      
      // Create per-operation AbortController and timeout
      const operationController = new AbortController();
      const operationTimeoutId = setTimeout(() => operationController.abort(), TIMEOUT_MS);
      
      try {
        let call;
        if (action === 'status') {
          call = propertyService.updateStatus(id, status, { signal: operationController.signal });
        } else if (action === 'featured') {
          call = propertyService.setFeatured(id, featured, { signal: operationController.signal });
        } else {
          call = propertyService.deleteProperty(id, { signal: operationController.signal });
        }
        
        await call;
        results.succeeded += 1;
      } catch (err) {
        // Check if error was due to abort/timeout
        if (err.name === 'AbortError') {
          results.failed += 1;
          const friendly = 'Operation timed out';
          results.errors.push({ id, message: friendly });
          console.error(`Bulk property timeout for id=${id}:`, err);
          // Add remaining IDs to skipped array
          results.skipped = ids.slice(i + 1);
          // Break loop to prevent further operations
          break;
        } else {
          results.failed += 1;
          const friendly = err.name === 'ValidationError' ? 'Validation failed' :
                           err.name === 'CastError' ? 'Invalid ID format' :
                           'An unexpected error occurred';
          results.errors.push({ id, message: friendly });
          console.error(`Bulk property error for id=${id}:`, err);
        }
      } finally {
        // Clear operation timeout
        clearTimeout(operationTimeoutId);
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

import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Property from '@/server/src/models/property.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** Maximum rows streamed per export request to prevent OOM on large datasets */
const EXPORT_ROW_LIMIT = 10_000;

function escapeCsv(val) {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvHeader() {
  return ['id','title','status','listingCategory','propertyType','locality','city','price','brokerName','brokerMobile','featured','createdAt'].join(',');
}

function csvRow(p) {
  const cols = [
    String(p._id),
    p.title || '',
    p.status || '',
    p.listingCategory || '',
    p.propertyType || '',
    p.location?.locality || '',
    p.location?.city || '',
    p.price ?? '',
    p.brokerId?.name || '',
    p.brokerId?.mobile || '',
    p.featured ? 'Yes' : 'No',
    p.createdAt ? new Date(p.createdAt).toISOString() : '',
  ];
  return cols.map(escapeCsv).join(',');
}

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'properties');
    if (permErr) return permErr;

    await connectDB();

    const cursor = Property.find()
      .maxTimeMS(60_000)
      .limit(EXPORT_ROW_LIMIT)
      .batchSize(500)
      .populate('brokerId', 'name mobile')
      .lean()
      .cursor();

    // Stream CSV rows directly to the client — no in-memory accumulation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(csvHeader() + '\n'));
          for await (const p of cursor) {
            controller.enqueue(encoder.encode(csvRow(p) + '\n'));
          }
        } catch (err) {
          console.error('CSV export stream error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
      cancel() {
        cursor.close().catch(() => {});
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="properties.csv"',
        'X-Export-Row-Limit': String(EXPORT_ROW_LIMIT),
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import PurchaseSubscription from '@/server/src/models/purchaseSubscription.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

function escapeCsv(val) {
  const str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvHeader() {
  return ['id','planName','userName','userMobile','amountPaid','method','status','startDate','endDate','createdAt'].join(',');
}

function csvRow(t) {
  const cols = [
    String(t._id),
    t.planName || '',
    t.userId?.name || '',
    t.userId?.mobile || '',
    t.paymentDetails?.amountPaid ?? t.price ?? '',
    t.paymentDetails?.method || '',
    t.status || '',
    t.startDate ? new Date(t.startDate).toISOString() : '',
    t.endDate ? new Date(t.endDate).toISOString() : '',
    t.createdAt ? new Date(t.createdAt).toISOString() : '',
  ];
  return cols.map(escapeCsv).join(',');
}

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'revenue');
    if (permErr) return permErr;

    await connectDB();
    const cursor = PurchaseSubscription.find()
      .maxTimeMS(60_000)
      .batchSize(500)
      .populate('userId', 'name mobile')
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    const chunks = [csvHeader()];
    try {
      for await (const t of cursor) {
        chunks.push(csvRow(t));
      }
    } finally {
      await cursor.close();
    }

    const csv = chunks.join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

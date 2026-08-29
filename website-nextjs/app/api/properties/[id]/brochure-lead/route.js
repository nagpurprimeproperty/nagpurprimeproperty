import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import userService from '@/server/src/modules/user/user.service.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;
    const userId = auth.user.id || auth.user._id;
    const userIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const property = await propertyService.getProperty(id, userId, userIp);
    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    if (!property.brochure) {
      return NextResponse.json({ success: false, message: 'No brochure available for this property' }, { status: 404 });
    }

    const fullUser = await userService.getUser(userId).catch(() => null);

    const userArg = {
      id: userId.toString(),
      name: fullUser?.name || auth.user?.name || 'Verified User',
      mobile: fullUser?.mobile || auth.user?.mobile || '9876543210',
    };

    const realPropertyId = property._id;
    console.log(`[Website Brochure Lead] 🚀 Processing brochure download for property "${property.title}" (${realPropertyId}), Buyer: "${userArg.name}" (${userArg.mobile})`);

    const existingLead = await leadService.getLeadByPropertyAndUser(realPropertyId, userId);
    const brokerId = property.brokerId?._id || property.brokerId;
    const brokerDetails = await userService.getUser(brokerId).catch(() => null);

    if (existingLead) {
      console.log(`[Website Brochure Lead] ℹ️ Lead already exists for user ${userId} and property ${realPropertyId}`);
      return NextResponse.json({
        success: true,
        message: 'Brochure accessed (lead already exists)',
        brochureUrl: property.brochure,
        data: { brochureUrl: property.brochure, ...(existingLead._doc || existingLead), brokerDetails },
      });
    }

    const lead = await leadService.createLeadByOnlyFetchDataFromPropertyId(realPropertyId, userArg);

    return NextResponse.json({
      success: true,
      message: 'Brochure accessed and lead recorded',
      brochureUrl: property.brochure,
      data: { brochureUrl: property.brochure, ...(lead._doc || lead), brokerDetails },
    });
  } catch (err) {
    console.error('[Website Brochure Lead] ❌ Error in brochure-lead route:', err.message);
    const status = err.status || 500;
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status });
  }
}

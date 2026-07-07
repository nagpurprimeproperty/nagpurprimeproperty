import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

    // Fetch full user details to obtain customer name and mobile
    const fullUser = await userService.getUser(userId).catch(() => null);
    console.log('[DEBUG LOG] fullUser:', JSON.stringify(fullUser, null, 2));

    const userArg = {
      id: userId.toString(),
      name: fullUser?.name || auth.user?.name || 'Verified User',
      mobile: fullUser?.mobile || auth.user?.mobile || '9876543210',
    };

    const property = await propertyService.getProperty(id, userId, userIp);
    console.log('[DEBUG LOG] property:', JSON.stringify(property, null, 2));
    const existingLead = await leadService.getLeadByPropertyAndUser(id, userId);

    const brokerId = property.brokerId?._id || property.brokerId;
    const brokerDetails = await userService.getUser(brokerId);

    if (existingLead) {
      return NextResponse.json({
        success: true,
        message: 'Lead already exists for this property and user',
        data: { ...existingLead, brokerDetails }
      });
    }

    const lead = await leadService.createLeadByOnlyFetchDataFromPropertyId(id, userArg);

    return NextResponse.json({ success: true, data: { ...lead._doc, brokerDetails } });
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status });
  }
}

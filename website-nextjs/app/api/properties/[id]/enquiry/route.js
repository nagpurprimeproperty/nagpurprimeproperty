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

    const body = await req.json();

    const property = await propertyService.getProperty(id, userId, userIp);
    const existingLead = await leadService.getLeadByPropertyAndUser(id, userId);

    const brokerId = property.brokerId?._id || property.brokerId;
    const brokerDetails = await userService.getUser(brokerId).catch(() => null);

    if (existingLead) {
      return NextResponse.json({
        success: true,
        message: 'Lead already exists for this property and user',
        data: { ...(existingLead._doc || existingLead), brokerDetails }
      });
    }

    // Fetch full user details as fallback
    const fullUser = await userService.getUser(userId).catch(() => null);

    const customerName = body.name || body.customerName || fullUser?.name || 'Verified User';
    const phone = body.mobile || body.phone || fullUser?.mobile || '9876543210';
    const notes = body.message || body.notes || '';

    const leadPayload = {
      customerName,
      phone,
      notes,
      propertyType: property.propertyType,
      area: property.location?.locality,
      budget: property.pricing?.totalPrice || property?.pricing?.monthlyRent,
      userId,
      propertyId: id,
      brokerId
    };

    const lead = await leadService.createLead(leadPayload);

    return NextResponse.json({ success: true, data: { ...(lead._doc || lead), brokerDetails } });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}


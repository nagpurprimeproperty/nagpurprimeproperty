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
    if (!property) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const realPropertyId = property._id;
    const existingLead = await leadService.getLeadByPropertyAndUser(realPropertyId, userId);

    const brokerId = property.brokerId?._id || property.brokerId;
    const brokerDetails = await userService.getUser(brokerId).catch(() => null);

    if (existingLead) {
      console.log(`[Website Enquiry] ℹ️ Lead already exists for user ${userId} and property ${realPropertyId}`);
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

    console.log(`[Website Enquiry] 🚀 Creating Schedule Visit enquiry for property "${property.title}" (${realPropertyId}), Broker: ${brokerId}, Buyer: ${customerName} (${phone})`);

    const leadPayload = {
      customerName,
      phone,
      notes,
      propertyType: property.propertyType || 'Residential',
      area: property.location?.locality || property.location?.city || property.area || 'Nagpur',
      budget: String(property.pricing?.totalPrice || property?.pricing?.monthlyRent || property.totalPrice || property.price || 'Price on request'),
      userId,
      propertyId: realPropertyId,
      brokerId,
      source: 'Website Lead',
    };

    const lead = await leadService.createLead(leadPayload);

    return NextResponse.json({ success: true, data: { ...(lead._doc || lead), brokerDetails } });
  } catch (err) {
    console.error('[Website Enquiry] ❌ Error handling enquiry route:', err.message);
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}


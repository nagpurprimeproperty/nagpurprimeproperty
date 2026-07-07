import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Subscription from '@/server/src/models/purchaseSubscription.model.js';
import Plan from '@/server/src/models/subscription.model.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PUT /api/v1/admin/users/:id/plans/:planRecordId */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id, planRecordId } = await params;
    const { planId, startDate, endDate, status, paymentId, orderId, method } = await req.json();

    const subscription = await Subscription.findOne({ _id: planRecordId, userId: id });
    if (!subscription) return NextResponse.json({ success: false, message: 'Plan record not found' }, { status: 404 });

    if (planId && planId !== String(subscription.planId)) {
      const plan = await Plan.findById(planId);
      if (!plan) return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
      subscription.planId              = plan._id;
      subscription.planName            = plan.name;
      subscription.isFree              = plan.isFree;
      subscription.price               = plan.price;
      subscription.duration            = plan.duration;
      subscription.durationUnit        = plan.durationUnit;
      subscription.isDurationUnlimited = plan.isDurationUnlimited;
      subscription.limits              = { ...plan.limits };
      if (!plan.isDurationUnlimited && startDate && !endDate) {
        const start = new Date(startDate);
        const end   = new Date(start);
        if (plan.durationUnit === 'days')   end.setDate(end.getDate() + plan.duration);
        if (plan.durationUnit === 'months') end.setMonth(end.getMonth() + plan.duration);
        if (plan.durationUnit === 'years')  end.setFullYear(end.getFullYear() + plan.duration);
        subscription.endDate = end;
      }
    }

    if (startDate) subscription.startDate = new Date(startDate);
    if (endDate)   subscription.endDate   = new Date(endDate);
    if (status)    subscription.status    = status;

    subscription.paymentDetails = {
      ...subscription.paymentDetails,
      ...(paymentId && { paymentId }),
      ...(orderId   && { orderId }),
      ...(method    && { method }),
    };

    await subscription.save();
    return NextResponse.json(successResponse(subscription, 'Plan updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/users/:id/plans/:planRecordId */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id, planRecordId } = await params;
    const plan = await Subscription.findOneAndDelete({ _id: planRecordId, userId: id });
    if (!plan) return NextResponse.json({ success: false, message: 'Plan record not found' }, { status: 404 });
    return NextResponse.json(successResponse(null, 'Plan record deleted'));
  } catch (err) {
    return handleApiError(err);
  }
}

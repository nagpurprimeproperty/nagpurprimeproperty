import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Subscription from '@/server/src/models/purchaseSubscription.model.js';
import Plan from '@/server/src/models/subscription.model.js';
import User from '@/server/src/models/user.model.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';
import mongoose from 'mongoose';
import revenueService from '@/server/src/modules/revenue/revenue.service.js';
import logger from '@/server/src/utils/logger.js';

/** GET /api/v1/admin/users/:id/plans */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const plans = await Subscription.find({ userId: id }).sort({ createdAt: -1 });
    return NextResponse.json(successResponse(plans, 'User plans fetched'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/users/:id/plans */
export async function POST(req, { params }) {
  let session;
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    session = await mongoose.startSession();
    session.startTransaction();
    const { planId, startDate, endDate, status = 'Active', paymentId, orderId, method } = await req.json();

    if (!planId || !startDate) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ success: false, message: 'planId and startDate are required' }, { status: 400 });
    }

    const [user, plan] = await Promise.all([
      User.findById(id).session(session),
      Plan.findById(planId).session(session),
    ]);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    let end = endDate ? new Date(endDate) : undefined;

    if (!plan.isDurationUnlimited && !end) {
      end = new Date(start);
      if (plan.durationUnit === 'days')   end.setDate(end.getDate() + plan.duration);
      if (plan.durationUnit === 'months') end.setMonth(end.getMonth() + plan.duration);
      if (plan.durationUnit === 'years')  end.setFullYear(end.getFullYear() + plan.duration);
    }

    const [subscription] = await Subscription.create([{
      userId: id,
      planId: plan._id,
      planName: plan.name,
      startDate: start,
      endDate: end,
      status,
      isFree: plan.isFree,
      price: plan.price,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      isDurationUnlimited: plan.isDurationUnlimited,
      limits: { ...plan.limits },
      paymentDetails: {
        paymentId:  paymentId  || undefined,
        orderId:    orderId    || undefined,
        amountPaid: plan.isFree ? 0 : plan.price,
        method:     method     || undefined,
      },
      usage: { propertiesPosted: 0, leadsUnlocked: 0, featuredPropertiesUsed: 0 },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Invalidate revenue cache when subscription is created/updated
    try {
      await revenueService.invalidateCache();
    } catch (cacheErr) {
      // Use structured logging without PII
      logger.error('Cache invalidation failed', {
        error: cacheErr.message,
        timestamp: new Date().toISOString()
      });
      
      // Emit monitoring event/metric
      // TODO: Replace with actual metrics client when available
      console.log('METRIC: cache_invalidation_failure', 1);
      
      // TODO: In production, enqueue proper background job via job system (BullMQ/SQS/Vercel Queue)
      // For now, continue without blocking the response
    }

    return NextResponse.json(successResponse(subscription, 'Plan assigned successfully'), { status: 201 });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return handleApiError(err);
  }
}

import purchasePlanService from './purchasePlan.service.js';

/**
 * POST /api/v1/subscriptions/purchase/:id/create-order
 * Creates a Razorpay order for the requested plan.
 * Returns order details for the frontend to open Razorpay checkout.
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: planId } = req.params;

    const result = await purchasePlanService.createOrder(userId, planId);

    if (result.free) {
      return res.status(201).json({
        success: true,
        message: 'Free plan activated successfully',
        data: result.subscription,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created. Complete payment to activate subscription.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/subscriptions/purchase/webhook
 * Razorpay webhook – receives payment events.
 * IMPORTANT: Uses raw body (set in route before JSON middleware).
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay signature header' });
    }

    const result = await purchasePlanService.handleWebhook(req.rawBody, signature);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Always return 200 to Razorpay so it doesn't retry; log the error server-side
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/v1/subscriptions/purchase/my
 * Returns the currently active subscription of the logged-in user.
 */
export const getMySubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const subscription = await purchasePlanService.getMySubscription(userId);

    return res.status(200).json({
      success: true,
      message: subscription ? 'Active subscription found' : 'No active subscription',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/subscriptions/purchase/history
 * Returns the full subscription purchase history of the logged-in user.
 */
export const getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page, limit } = req.query;
    const result = await purchasePlanService.getMyHistory(userId, { page, limit });

    return res.status(200).json({
      success: true,
      message: 'Subscription history fetched',
      data: result?.data || [],
      total: result?.total || 0,
      page: result?.page || 1,
      limit: result?.limit || 10,
      totalPages: result?.totalPages || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/subscriptions/purchase/:id
 * Returns a specific subscription by ID (must belong to the user).
 */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const subscription = await purchasePlanService.getSubscriptionById(userId, id);

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

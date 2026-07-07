import mongoose from 'mongoose';
import planService from './plan.service.js';

/**
 * GET /api/v1/subscriptions/plans
 * Query: ?page=1&limit=10&isActive=true
 */
export const getAllPlans = async (req, res, next) => {
  try {
    const { page, limit, isActive } = req.query;
    const result = await planService.listPlans({ page, limit, isActive });

    return res.status(200).json({
      success: true,
      message: 'Subscription plans fetched successfully',
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
 * GET /api/v1/subscriptions/plans/:id
 */
export const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }

    const plan = await planService.getPlan(id);

    return res.status(200).json({
      success: true,
      message: 'Subscription plan fetched successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

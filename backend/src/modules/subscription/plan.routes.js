import { Router } from 'express';
import { getAllPlans, getPlanById } from './plans.controller.js';

const router = Router();

/**
 * GET /api/v1/subscriptions/plans
 * Query: ?page=1&limit=10&isActive=true
 * Returns paginated subscription plans.
 */
router.get('/', getAllPlans);

/**
 * GET /api/v1/subscriptions/plans/:id
 * Returns a single plan by ID.
 */
router.get('/:id', getPlanById);

export default router;

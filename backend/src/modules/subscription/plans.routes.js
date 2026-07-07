import { Router } from 'express';
import { userProtect } from '../../middlewares/auth.middleware.js';
import {
  createOrder,
  handleWebhook,
  getMySubscription,
  getMyHistory,
  getSubscriptionById,
} from './purchasePlan.controller.js';

const router = Router();

// ── Webhook (PUBLIC — no auth, raw body required) ──────────────────────────
// Must be declared BEFORE express.json() can strip the body.
// Raw body capture is handled in app.js via a conditional middleware.
router.post('/webhook', handleWebhook);

// ── Authenticated routes ───────────────────────────────────────────────────
router.use(userProtect);

/**
 * POST /api/v1/subscriptions/purchase/:id/create-order
 * Body: none
 * Creates a Razorpay order for the requested plan.
 */
router.post('/:id/create-order', createOrder);

/**
 * Backwards-compatible alias for POST /api/v1/subscriptions/purchase/:id/create-order
 */
router.post('/:id', createOrder);

/**
 * GET /api/v1/subscriptions/purchase/my
 * Returns the currently active subscription of the logged-in user.
 */
router.get('/my', getMySubscription);

/**
 * GET /api/v1/subscriptions/purchase/history
 * Query: ?page=1&limit=10
 * Returns the subscription purchase history of the logged-in user.
 */
router.get('/history', getMyHistory);

/**
 * GET /api/v1/subscriptions/purchase/:id
 * Returns a specific subscription by ID (must belong to the user).
 */
router.get('/:id', getSubscriptionById);

export default router;

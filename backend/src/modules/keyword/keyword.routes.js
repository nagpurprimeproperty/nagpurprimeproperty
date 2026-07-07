import express from 'express';
import keywordController from './keyword.controller.js';

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
/** GET  /api/v1/keywords          — list active keywords (homepage SEO) */
router.get('/', keywordController.getActive);

/** POST /api/v1/keywords/:id/click — track a click (no auth needed) */
router.post('/:id/click', keywordController.trackClick);

export default router;

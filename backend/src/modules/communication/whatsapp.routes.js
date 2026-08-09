import { Router } from 'express';
import { verifyWebhook, receiveWebhook } from './whatsapp.controller.js';

const router = Router();

router.get('/whatsapp', verifyWebhook);
router.post('/whatsapp', receiveWebhook);

export default router;

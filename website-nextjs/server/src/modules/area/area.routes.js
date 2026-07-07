// area.routes.js
import { Router } from 'express';
import areaController from './area.controller.js';

const router = Router();

router.get('/', areaController.getAreas);
router.get('/:slug', areaController.getArea);

export default router;

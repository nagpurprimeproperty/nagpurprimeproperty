// blog.routes.js
import { Router } from 'express';
import blogController from './blog.controller.js';

const router = Router();

router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlog);

export default router;

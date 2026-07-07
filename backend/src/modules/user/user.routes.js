import {Router} from 'express';
import userAuthRoutes from './user.auth.routes.js';
import userProfileRoutes from './user.profile.routes.js';
import {userProtect} from '../../middlewares/auth.middleware.js';
import {getUserStats} from './user.controller.js';
import {authLimiter} from '../../middlewares/rate-limit.middleware.js';

const router = Router();

router.use('/auth', authLimiter,  userAuthRoutes);
router.use('/profile', userProtect, userProfileRoutes);
router.get('/stats', userProtect, getUserStats);

export default router;
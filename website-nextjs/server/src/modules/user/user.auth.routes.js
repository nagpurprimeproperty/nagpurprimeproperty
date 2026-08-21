import {Router} from 'express';
import {loginUser,resendOTP,verifyOTP,logoutUser} from './user.controller.js';
import {loginUserSchema,resendOTPSchema,verifyOTPSchema} from './user.schema.js';
import validate from '../../middlewares/validate.middleware.js';
import { userProtect } from '../../middlewares/auth.middleware.js';
const router = Router();

router.post('/login', validate(loginUserSchema), loginUser);
router.post('/resend-otp', validate(resendOTPSchema), resendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/logout', userProtect, logoutUser);
export default router;
import {Router} from 'express';
import {loginUser,verifyOTP,logoutUser, requestAccountDeletion, confirmAccountDeletion} from './user.controller.js';
import {loginUserSchema,verifyOTPSchema, requestDeletionSchema, confirmDeletionSchema} from './user.schema.js';
import validate from '../../middlewares/validate.middleware.js';
import { userProtect } from '../../middlewares/auth.middleware.js';
const router = Router();

router.post('/login', validate(loginUserSchema), loginUser);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/logout', userProtect, logoutUser);

router.post('/request-deletion', validate(requestDeletionSchema), requestAccountDeletion);
router.post('/confirm-deletion', validate(confirmDeletionSchema), confirmAccountDeletion);

export default router;
import {Router} from 'express';
import {getUserProfile, updateUserProfile} from './user.controller.js';
import {updateUserSchema} from './user.schema.js';
import validate from '../../middlewares/validate.middleware.js';
import upload from '../../config/storage.js';
const router = Router();

router.get('/', getUserProfile);
router.put('/', upload.single('avatar'),  validate(updateUserSchema), updateUserProfile);

export default router;
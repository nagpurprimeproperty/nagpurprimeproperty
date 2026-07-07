import { Router } from 'express';
import upload from '../../config/storage.js';
import { userProtect } from '../../middlewares/auth.middleware.js';
import { mediaUploadLimiter } from '../../middlewares/rate-limit.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import { uploadMedia, deleteMedia } from './media.controller.js';
import { mediaDeleteSchema } from './media.schema.js';

const router = Router();

// Protected upload (accepts single file: either photo or video)
router.post(
  '/upload',
  userProtect,
  mediaUploadLimiter,
  upload.single('file'),
  uploadMedia
);

// Delete single media by URL with validation
router.delete(
  '/',
  userProtect,
  validate(mediaDeleteSchema),
  deleteMedia
);

export default router;

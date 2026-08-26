import storageService from '../../services/storage.service.js';
import Property from '../property/property.model.js';
import { getRedis } from '../../config/redis.js';
import env from '../../config/env.js';

export const uploadMedia = async (req, res, next) => {
  try {
    // Accept single file (either photo or video)
    const file = req.file;

    if (!file) {
      return next({
        statusCode: 400,
        message: 'No file provided. Please upload either a photo or video.',
      });
    }

    // Determine upload folder based on file type
    let uploadFolder = 'properties';
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      uploadFolder = 'properties/videos';
    }

    // Upload single file and get URL
    const result = await storageService.upload(file, uploadFolder);
    const mediaUrl = result.url || result;

    // Track ownership in Redis for newly uploaded media (TTL: 7 days)
    if (req.user?._id && mediaUrl) {
      try {
        const redis = getRedis();
        if (redis) {
          await redis.set(`media_owner:${mediaUrl}`, req.user._id.toString(), 'EX', 7 * 86400);
        }
      } catch (redisErr) {
        console.warn('[media/upload] Redis ownership tracking error:', redisErr.message);
      }
    }

    // Return single URL directly
    res.status(201).json({ 
      success: true, 
      data: {
        url: mediaUrl,
        key: result.key,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const { url } = req.body;
    const userId = req.user?._id?.toString();

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid media URL is required',
      });
    }

    // 1. Storage domain check
    if (env.S3_PUBLIC_URL && !url.startsWith(env.S3_PUBLIC_URL)) {
      return res.status(400).json({
        success: false,
        message: 'URL does not belong to platform storage',
      });
    }

    // 2. Ownership verification
    let isOwner = false;

    // Check A: Tracked upload in Redis
    try {
      const redis = getRedis();
      if (redis) {
        const uploaderId = await redis.get(`media_owner:${url}`);
        if (uploaderId && uploaderId === userId) {
          isOwner = true;
        }
      }
    } catch (redisErr) {
      // Redis unavailable fallback
    }

    // Check B: User avatar
    if (!isOwner && req.user?.avatar === url) {
      isOwner = true;
    }

    // Check C: Property owned by this broker
    if (!isOwner && req.user?._id) {
      const property = await Property.findOne({
        brokerId: req.user._id,
        $or: [
          { photos: url },
          { video: url },
          { brochure: url },
        ],
      }).select('_id');

      if (property) {
        isOwner = true;
      }
    }

    // Check D: If ownership could not be verified, deny deletion (IDOR protection)
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: You do not have ownership of this media asset',
      });
    }

    // 3. Delete from S3
    await storageService.delete(url);

    // Clean up Redis ownership key
    try {
      const redis = getRedis();
      if (redis) {
        await redis.del(`media_owner:${url}`);
      }
    } catch (e) {}

    res.json({ 
      success: true, 
      message: 'Media deleted successfully',
      url: url
    });
  } catch (err) {
    next(err);
  }
};

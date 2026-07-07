import rateLimit from 'express-rate-limit';

const ipKeyGenerator = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Auth limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Too many attempts, please try again later.',
  },
});

// Media upload limiter (adjusted to support uploading multiple photos concurrently)
export const mediaUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Media upload limit reached. Max 30 uploads per minute.',
  },
});
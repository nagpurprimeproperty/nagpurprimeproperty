import rateLimit from 'express-rate-limit';
import { getRedis } from '../config/redis.js';

class RedisStore {
  constructor(client, windowMs = 60 * 1000) {
    this.client = client;
    this.windowMs = windowMs;
  }
  async increment(key) {
    const redisKey = `ratelimit:api:${key}`;
    const multi = this.client.multi();
    multi.incr(redisKey);
    multi.ttl(redisKey);
    const results = await multi.exec();
    
    const hits = results[0][1];
    let ttl = results[1][1];
    
    if (ttl === -1) {
      const windowSec = Math.ceil(this.windowMs / 1000);
      await this.client.expire(redisKey, windowSec);
      ttl = windowSec;
    }
    
    const resetTime = new Date(Date.now() + (ttl * 1000));
    return { totalHits: hits, resetTime };
  }
  async decrement(key) {
    const redisKey = `ratelimit:api:${key}`;
    await this.client.decr(redisKey);
  }
  async resetKey(key) {
    const redisKey = `ratelimit:api:${key}`;
    await this.client.del(redisKey);
  }
}

// Instantiate RedisStore if Redis URL is configured
let redisStore;
try {
  const redis = getRedis();
  redisStore = new RedisStore(redis);
} catch (err) {
  console.warn('[ratelimit] Redis store not configured or unavailable, using in-memory store:', err.message);
}

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
  ...(redisStore && { store: redisStore }),
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
  ...(redisStore && { store: redisStore }),
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
  ...(redisStore && { store: redisStore }),
});
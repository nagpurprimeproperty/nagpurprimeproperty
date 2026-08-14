import Redis from 'ioredis';
import env from './env.js';

/**
 * Create a new Redis connection.
 * Supports both redis:// and rediss:// (TLS) URLs, including Upstash.
 * BullMQ requires SEPARATE connections for Queue and Worker.
 */
export function createRedisConnection() {
  if (!env.REDIS_URL) {
    throw new Error('REDIS_URL is not configured');
  }

  const url = env.REDIS_URL.trim();
  const isTLS = url.startsWith('rediss://');

  const client = new Redis(url, {
    // Required for Upstash TLS connections
    ...(isTLS && {
      tls: {
        rejectUnauthorized: false, // Upstash uses self-signed or intermediate certs
      },
    }),

    // BullMQ requirement: must be null so the library can manage retries itself
    maxRetriesPerRequest: null,

    connectTimeout: 10_000, // 10 s — don't block requests forever

    retryStrategy: (times) => {
      if (times > 3) {
        // Stop retrying after 3 attempts so routes don't hang
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      console.warn(`[redis] Retry #${times} in ${delay}ms`);
      return delay;
    },

    reconnectOnError: (err) => {
      return ['READONLY', 'ECONNRESET'].some((e) => err.message.includes(e));
    },
  });

  client.on('connect', () => console.log('[redis] Connected'));
  client.on('ready',   () => console.log('[redis] Ready'));
  client.on('error',   (err) => console.error('[redis] Error:', err.message));
  client.on('close',   () => console.warn('[redis] Connection closed'));

  return client;
}

class MockRedis {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    if (this.ttls.has(key) && this.ttls.get(key) < Date.now()) {
      this.store.delete(key);
      this.ttls.delete(key);
    }
    return this.store.get(key) || null;
  }

  async set(key, value, ex, ttlSeconds) {
    this.store.set(key, String(value));
    if (ex === 'EX' && ttlSeconds) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    }
  }

  async setex(key, ttlSeconds, value) {
    this.store.set(key, String(value));
    this.ttls.set(key, Date.now() + ttlSeconds * 1000);
  }

  async del(...keys) {
    for (const key of keys) {
      this.store.delete(key);
      this.ttls.delete(key);
    }
  }

  async incr(key) {
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, String(val));
    return val;
  }

  async expire(key, ttlSeconds) {
    this.ttls.set(key, Date.now() + ttlSeconds * 1000);
  }

  async quit() {
    // No-op
  }
}

// Default singleton for general use (e.g. caching — NOT for BullMQ worker)
let _defaultClient;

export function getRedis() {
  if (process.env.NODE_ENV === 'test') {
    if (!_defaultClient || !(_defaultClient instanceof MockRedis)) {
      _defaultClient = new MockRedis();
    }
    return _defaultClient;
  }

  if (!_defaultClient) {
    _defaultClient = createRedisConnection();
  }
  return _defaultClient;
}
 
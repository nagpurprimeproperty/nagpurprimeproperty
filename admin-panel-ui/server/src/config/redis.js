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

// Default singleton for general use (e.g. caching — NOT for BullMQ worker)
let _defaultClient;

export function getRedis() {
  if (!_defaultClient) {
    _defaultClient = createRedisConnection();
  }
  return _defaultClient;
}

export { getRedis as default, getRedis };
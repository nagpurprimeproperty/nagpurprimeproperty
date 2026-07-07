import { getRedis, isRedisAvailable, disableRedis } from '../config/redis.js';

const DEFAULT_TTL = 300; // 5 minutes
const REDIS_OP_TIMEOUT = 3000; // 3 s — max time to wait for a Redis read/write

const inflightPromises = new Map();

/**
 * Wrap a Redis call with a timeout so it never blocks the request pipeline.
 */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`[cache] Redis timeout (${ms}ms) for ${label}`)), ms)
    ),
  ]);
}

/**
 * Get or compute a cached value.
 * Falls through to the factory immediately if Redis is unavailable or slow.
 *
 * @param {string} key
 * @param {() => Promise<any>} factory
 * @param {number} ttl - seconds
 */
export async function getOrSet(key, factory, ttl = DEFAULT_TTL) {
  if (!isRedisAvailable()) {
    return factory();
  }

  // ── Deduplicate concurrent requests for the same key ──────────────────────
  const inflight = inflightPromises.get(key);
  if (inflight) return inflight;

  const compute = async () => {
    // ── 1. Try Redis read ─────────────────────────────────────────────────────
    try {
      const redis = getRedis();
      const cached = await withTimeout(redis.get(key), REDIS_OP_TIMEOUT, `GET ${key}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          console.warn(`[cache] Failed to parse cached value for key="${key}" — re-computing`);
        }
      }
    } catch (err) {
      console.warn(`[cache] Redis read skipped for key="${key}":`, err?.message);
      if (err?.message?.includes('limit exceeded') || err?.message?.includes('max requests') || err?.message?.includes('Closed')) {
        disableRedis();
      }
      // Fall through to factory — don't block the response
    }

    // ── 2. Run factory ────────────────────────────────────────────────────────
    const value = await factory();

    // ── 3. Write back to Redis (non-blocking — don't await) ───────────────────
    try {
      const redis = getRedis();
      withTimeout(
        redis.setex(key, ttl, JSON.stringify(value)),
        REDIS_OP_TIMEOUT,
        `SETEX ${key}`
      ).catch((err) => {
        console.warn(`[cache] Redis write skipped for key="${key}":`, err?.message);
        if (err?.message?.includes('limit exceeded') || err?.message?.includes('max requests') || err?.message?.includes('Closed')) {
          disableRedis();
        }
      });
    } catch (err) {
      console.warn(`[cache] Redis write error for key="${key}":`, err?.message);
    }

    return value;
  };

  const promise = compute().finally(() => {
    inflightPromises.delete(key);
  });

  inflightPromises.set(key, promise);
  return promise;
}

/**
 * Invalidate cache keys.
 * @param {string | string[]} keys
 */
export async function invalidateCache(keys) {
  if (!isRedisAvailable()) {
    return;
  }
  const arr = Array.isArray(keys) ? keys : [keys];
  try {
    const redis = getRedis();
    const expandedKeys = [];

    const scanPattern = async (pattern) => {
      let cursor = '0';
      const matches = [];

      do {
        const [nextCursor, keys] = await withTimeout(
          redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100),
          REDIS_OP_TIMEOUT,
          `SCAN ${pattern}`
        );
        cursor = nextCursor;
        matches.push(...keys);
      } while (cursor !== '0');

      return matches;
    };

    for (const key of arr) {
      if (
        typeof key === 'string' &&
        (key.includes('*') || key.includes('?') || key.includes('[') || key.includes(']'))
      ) {
        const matchingKeys = await scanPattern(key);
        expandedKeys.push(...matchingKeys);
      } else {
        expandedKeys.push(key);
      }
    }

    const uniqueKeys = [...new Set(expandedKeys)].filter(Boolean);
    if (uniqueKeys.length > 0) {
      await withTimeout(redis.del(...uniqueKeys), REDIS_OP_TIMEOUT, `DEL [${uniqueKeys.join(',')}]`);
    }
  } catch (err) {
    console.warn(`[cache] Redis delete error for keys=[${arr.join(', ')}]:`, err?.message);
  }
}

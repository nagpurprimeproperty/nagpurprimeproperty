/**
 * Simple in-memory rate limiter for Next.js App Router.
 * For production multi-instance deployments, swap this for a Redis-backed store.
 */

const MAX_STORE_SIZE = 10_000;

/** @type {Map<string, { count: number; resetAt: number; accessedAt: number; prev?: string; next?: string }>} */
const store = new Map();

// LRU tracking for O(1) eviction
let lruHead = null;
let lruTail = null;

function cleanupIfNeeded() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      removeFromLRU(key);
      store.delete(key);
    }
  }
}

function removeFromLRU(key) {
  const entry = store.get(key);
  if (!entry) return;
  
  // Update head pointer if removing head
  if (lruHead === key) {
    lruHead = entry.next;
  }
  
  // Update tail pointer if removing tail
  if (lruTail === key) {
    lruTail = entry.prev;
  }
  
  // Safely update neighbor pointers
  if (entry.prev && store.get(entry.prev)) {
    store.get(entry.prev).next = entry.next;
  }
  
  if (entry.next && store.get(entry.next)) {
    store.get(entry.next).prev = entry.prev;
  }
  
  entry.prev = undefined;
  entry.next = undefined;
}

function moveToHead(key) {
  removeFromLRU(key);
  
  const entry = store.get(key);
  entry.prev = undefined;
  entry.next = lruHead;
  
  if (lruHead) {
    store.get(lruHead).prev = key;
  } else {
    lruTail = key;
  }
  
  lruHead = key;
}

function lruEvictIfNeeded() {
  if (store.size <= MAX_STORE_SIZE) return;
  
  if (lruTail) {
    const tailKey = lruTail;
    removeFromLRU(tailKey);
    store.delete(tailKey);
  }
}

/**
 * Check if a key has exceeded the rate limit.
 *
 * @param {string} key          - Unique identifier (e.g. IP + route)
 * @param {number} maxRequests  - Max requests allowed in window
 * @param {number} windowMs     - Time window in milliseconds
 * @returns {{ allowed: boolean; remaining: number; resetAt: number }}
 */
export function rateLimitCheck(key, maxRequests = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    const resetAt = now + windowMs;
    lruEvictIfNeeded();
    store.set(key, { count: 1, resetAt, accessedAt: now });
    moveToHead(key);
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    entry.accessedAt = now;
    moveToHead(key);
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  entry.accessedAt = now;
  moveToHead(key);
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Background cleanup every 60s (safe for long-running Node processes; skip in serverless)
if (typeof globalThis !== 'undefined' && !process.env.SERVERLESS) {
  setInterval(cleanupIfNeeded, 60_000);
}

/**
 * Get a rate-limit key from a NextRequest.
 * Prefers connection remote address; falls back to X-Forwarded-For only when trusted.
 *
 * @param {import('next/server').NextRequest} req
 * @param {string} [suffix] - Optional route suffix to scope the key
 * @returns {string}
 */
export function getRateLimitKey(req, suffix = '') {
  const forwarded = req.headers.get('x-forwarded-for');
  const trustProxy = process.env.TRUSTED_PROXY === 'true';
  let ip;
  if (trustProxy && forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip;
  }
  return suffix ? `${ip || 'unknown'}:${suffix}` : (ip || 'unknown');
}

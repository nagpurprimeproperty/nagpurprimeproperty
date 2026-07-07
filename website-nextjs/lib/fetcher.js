// lib/fetcher.js

const TIMEOUT_MS = 8000;

/**
 * selfFetch — calls the website's OWN Next.js API routes (/api/...).
 * Used by server components to read from MongoDB via the built-in API routes.
 * Does NOT depend on the Express server being running.
 *
 * @param {string} path - The API path (e.g. '/api/areas')
 * @param {RequestInit & { revalidate?: number }} options
 *   Pass `revalidate: N` (seconds) for ISR caching, or omit for no-store (always fresh).
 *   Pages using `export const revalidate = N` should also pass `revalidate: N` here.
 */
export async function selfFetch(path, options = {}) {
  const base = process.env.WEBSITE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
  const url = `${base}${path}`;

  // Build next cache options — use page-level revalidate if provided, else no-store
  const { revalidate, ...restOptions } = options;
  const nextCache = revalidate !== undefined
    ? { next: { revalidate } }
    : { cache: 'no-store' };

  let controller;
  let timeoutId;

  try {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      ...restOptions,
      ...nextCache,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(err.message || `Request failed: ${res.status}`);
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Self-fetch timeout: ${url} did not respond within ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * serverFetch — calls the Express backend directly (server-to-server).
 * Has a 5s timeout so Next.js never hangs if backend is offline.
 */
export async function serverFetch(path, options = {}) {
  const base = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
  const url = `${base}/api/v1${path}`;

  let controller;
  let timeoutId;

  try {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      cache: options.cache ?? 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(err.message || `Request failed: ${res.status}`);
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Backend timeout: ${url} did not respond within ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}


/**
 * Client-side fetch — calls Next.js BFF API routes (same origin).
 * Used inside TanStack Query queryFn / mutationFn.
 */
export async function clientFetch(path, options = {}) {
  const { auth, body, method, ...rest } = options;
  
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  
  const headers = {
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    ...(options.headers || {}),
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, {
    method: method || (body ? 'POST' : 'GET'),
    ...rest,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

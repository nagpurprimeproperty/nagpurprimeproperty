// Helper: proxy a fetch to the Express backend with a hard timeout.
// Returns a NextResponse for you to return directly from the route handler.
import { NextResponse } from 'next/server';

const TIMEOUT_MS = 5000;

export async function proxyToBackend(backendUrl, init = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(backendUrl, { ...init, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[BFF Proxy Error] Failed to fetch from backend url: ${backendUrl}`, err);
    if (err.name === 'AbortError') {
      return NextResponse.json({ success: false, message: 'Backend offline or timed out.' }, { status: 503 });
    }
    const isConnRefused = err.message?.includes('fetch failed') || err.code === 'ECONNREFUSED';
    const msg = isConnRefused 
      ? 'Express backend server is offline. Please make sure the backend is running on port 4000.'
      : (err.message || 'Internal error.');
    return NextResponse.json({ success: false, message: msg }, { status: isConnRefused ? 503 : 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}

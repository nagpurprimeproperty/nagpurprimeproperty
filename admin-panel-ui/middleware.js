import { NextResponse } from 'next/server';

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? (() => {
      const filtered = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter((o) => o !== '');
      return filtered.length > 0 ? filtered : ['http://localhost:3000'];
    })()
  : ['http://localhost:3000'];

/**
 * CORS + Security Headers Middleware
 * Applies to all API routes under /api/v1/admin
 */
export function middleware(request) {
  const origin = request.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  const allowedOriginValue = allowedOrigins.includes('*') ? '*' : origin;

  // Handle preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', allowedOriginValue);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  const response = NextResponse.next();

  // CORS
  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', allowedOriginValue);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // CSP — allow Google Maps CDN resources required by the map UI
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
    "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com",
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/api/v1/admin/:path*'],
};

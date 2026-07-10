import { NextResponse } from 'next/server';

let cachedSettings = null;
let lastFetched = 0;
const CACHE_TTL = 5000; // 5-second cache to protect DB and keep performance snappy

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Bypass static files, images, favicon, and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const origin = req.nextUrl.origin;
  const now = Date.now();
  let settings = cachedSettings;

  // Fetch settings once every 5 seconds
  if (!settings || (now - lastFetched > CACHE_TTL)) {
    try {
      const res = await fetch(`${origin}/api/settings`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          settings = json.data;
          cachedSettings = settings;
          lastFetched = now;
        }
      }
    } catch (err) {
      console.error('[Middleware] Failed to fetch system settings:', err.message);
    }
  }

  if (settings) {
    // 1. Maintenance Mode takes precedence
    if (settings.isMaintenanceMode) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
      return NextResponse.next();
    }

    // 2. Coming Soon Mode
    if (settings.isComingSoonMode) {
      if (pathname !== '/coming-soon') {
        return NextResponse.redirect(new URL('/coming-soon', req.url));
      }
      return NextResponse.next();
    }
  }

  // If neither mode is active but the user explicitly lands on /maintenance or /coming-soon,
  // redirect them to the home page.
  if (pathname === '/maintenance' || pathname === '/coming-soon') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, logo.jpeg etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|.*\\..*).*)',
  ],
};

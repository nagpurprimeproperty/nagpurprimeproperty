import { NextResponse } from 'next/server';

/**
 * POST /api/v1/admin/auth/logout
 * Clears the httpOnly refresh token cookie.
 * The client is responsible for clearing the access token from memory/localStorage.
 */
export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/admin/auth/refresh',
    maxAge: 0, // Expire immediately
  });
  return res;
}

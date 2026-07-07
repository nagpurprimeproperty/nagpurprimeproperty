import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Extract and verify the Bearer token from the request.
 * @param {import('next/server').NextRequest} req
 * @returns {{ id: string; role: string; isActive: boolean } | null}
 */
export function getAuthUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return /** @type {any} */ (jwt.verify(token, env.JWT_SECRET));
  } catch {
    return null;
  }
}

/**
 * Require a valid JWT. Returns { user } or a NextResponse 401.
 * @param {import('next/server').NextRequest} req
 * @returns {{ user: { id: string; role: string; isActive: boolean } } | NextResponse}
 */
export function requireAuth(req) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }
  return { user };
}

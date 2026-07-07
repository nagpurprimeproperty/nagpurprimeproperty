import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../modules/user/user.model.js';

/**
 * attachUser
 * ----------
 * Optionally identifies the current user from:
 *   1. HttpOnly cookie  → req.cookies.userToken
 *   2. Authorization header → Bearer <token>
 *
 * On token found & valid  → attaches lean user doc to req.user and calls next()
 * On no token / invalid   → silently calls next() without blocking
 *
 * Use this middleware on public routes that have optional user-aware behavior.
 * For protected routes that require authentication, use a separate guard middleware.
 */
export const attachUser = async (req, res, next) => {
  try {
    // ── 1. Extract token ────────────────────────────────────────────────────
    let token;

    if (req.cookies?.userToken) {
      token = req.cookies.userToken;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token — skip silently, don't block
    if (!token) return next();

    // ── 2. Verify token ─────────────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      // Invalid or expired token — skip silently, don't block
      return next();
    }

    // ── 3. Fetch user from DB ───────────────────────────────────────────────
    const user = await User.findById(decoded.id).select(
      '-password -otp -otpExpiresAt -passwordResetToken -passwordResetExpiresAt'
    );

    // ── 4. Attach to request if user exists ─────────────────────────────────
    if (user) req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
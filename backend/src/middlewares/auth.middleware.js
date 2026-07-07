import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import  User from '../modules/user/user.model.js';
 

/**
 * protect
 * -------
 * Verifies the admin JWT from:
 *   1. HttpOnly cookie  → req.cookies.adminToken
 *   2. Authorization header → Bearer <token>
 *
 * On success  → attaches lean admin doc to req.admin and calls next()
 * On failure  → returns 401 / 403 JSON response
 */
export const userProtect = async (req, res, next) => {
  try {
    // ── 1. Extract token ────────────────────────────────────────────────────
    let token;

    if (req.cookies?.userToken) {
      token = req.cookies.userToken;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }


    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // ── 2. Verify token ─────────────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? 'Session expired. Please log in again.' : 'Invalid token.',
      });
    }

    // ── 3. Fetch user from DB ───────────────────────────────────────────────
    // Exclude all sensitive select:false fields — not needed for request context
    const  user = await  User.findById(decoded.id).select(
      '-password -otp -otpExpiresAt -passwordResetToken -passwordResetExpiresAt'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. The user no longer exists.',
      });
    }

    // ── 4. Attach to request ─────────────────────────────────────────────────
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
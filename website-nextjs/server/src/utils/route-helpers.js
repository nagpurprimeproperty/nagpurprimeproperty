import { NextResponse } from 'next/server';

/**
 * handleApiError — Next.js equivalent of Express errorMiddleware.
 *
 * Handles:
 *  - Custom { status, message } throw pattern
 *  - Mongoose ValidationError
 *  - Mongoose duplicate key (11000)
 *  - JWT errors (JsonWebTokenError, TokenExpiredError)
 *  - Zod/structured errors with err.errors array
 *  - Generic fallback
 *
 * @param {unknown} err
 * @returns {NextResponse}
 */
export function handleApiError(err) {
  if (err && typeof err === 'object') {
    const e = /** @type {any} */ (err);

    // ── Multer-like file type error ─────────────────────────────────────
    if (e.message === 'Invalid file type') {
      return NextResponse.json(
        { success: false, message: 'Invalid file type', errors: [{ field: 'file', message: 'Only images are allowed' }] },
        { status: 400 }
      );
    }

    // ── Mongoose ValidationError ────────────────────────────────────────
    if (e.name === 'ValidationError' && e.errors) {
      const errors = Object.values(e.errors).map((v) => ({
        field:   v.path,
        message: v.message,
      }));
      return NextResponse.json(
        { success: false, message: 'Validation Error', errors },
        { status: 400 }
      );
    }

    // ── Mongoose duplicate key ──────────────────────────────────────────
    if (e.code === 11000 && e.keyValue) {
      const fields = Object.keys(e.keyValue);
      return NextResponse.json(
        {
          success: false,
          message: 'Duplicate field value',
          errors: fields.map((field) => ({ field, message: `${field} already exists` })),
        },
        { status: 409 }
      );
    }

    // ── JWT ─────────────────────────────────────────────────────────────
    if (e.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token', errors: [{ field: 'token', message: 'Invalid token' }] },
        { status: 401 }
      );
    }
    if (e.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token expired', errors: [{ field: 'token', message: 'Token expired' }] },
        { status: 401 }
      );
    }

    // ── Structured errors already have errors array ─────────────────────
    if (Array.isArray(e.errors)) {
      const status = e.statusCode || e.status || 400;
      return NextResponse.json(
        { success: false, message: e.message || 'Validation Error', errors: e.errors },
        { status }
      );
    }

    // ── Custom { status/statusCode, message } throw pattern ────────────
    if ((e.status || e.statusCode) && e.message) {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: e.status || e.statusCode }
      );
    }
  }

  console.error('Unhandled API error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  const rawMessage = isDev && err && typeof err === 'object' && 'message' in err ? err.message : undefined;
  const safeMessage = typeof rawMessage === 'string' ? rawMessage : 'Internal Server Error';
  return NextResponse.json(
    {
      success: false,
      message: safeMessage,
    },
    { status: 500 }
  );
}

/**
 * Format Zod v3/v4 safeParse errors into { field, message }[]
 * @param {import('zod').ZodError} zodError
 */
export function formatZodErrors(zodError) {
  return zodError.issues.map((issue) => ({
    field:   issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Return a 400 Validation Error response with structured errors.
 * @param {import('zod').ZodError} zodError
 */
export function zodErrorResponse(zodError) {
  return NextResponse.json(
    { success: false, message: 'Validation Error', errors: formatZodErrors(zodError) },
    { status: 400 }
  );
}

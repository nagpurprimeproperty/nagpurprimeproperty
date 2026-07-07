import multer from "multer";
import env from "../config/env.js";
import logger from "../utils/logger.js";

export default function errorMiddleware(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const isProd = env.NODE_ENV === "production";
  const isTest = env.NODE_ENV === "test";
  void _next;

  if (!isTest) {
    const message = err && typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);

    logger.error(message, {
      url: req.originalUrl,
      method: req.method,
      stack: err?.stack,
    });
  }

  // ── Multer ─────────────────────────────────────────────
  if (err instanceof multer.MulterError) {
    let message = "File upload error";

    if (err.code === "LIMIT_FILE_SIZE") message = "File too large";
    else if (err.code === "LIMIT_FILE_COUNT") message = "Too many files uploaded";
    else if (err.code === "LIMIT_UNEXPECTED_FILE") message = "Unexpected file field";

    return res.status(400).json({
      success: false,
      message,
      errors: [{ field: "file", message }],
    });
  }

  // ── File type ──────────────────────────────────────────
  if (err.message === "Invalid file type") {
    return res.status(400).json({
      success: false,
      message: "Invalid file type",
      errors: [
        {
          field: "file",
          message: "Only images and PDFs are allowed",
        },
      ],
    });
  }

  // ── Mongoose Validation ────────────────────────────────
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // ── Duplicate key ──────────────────────────────────────
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);

    return res.status(409).json({
      success: false,
      message: "Duplicate field value",
      errors: fields.map((field) => ({
        field,
        message: `${field} already exists`,
      })),
    });
  }

  // ── JWT ────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: [{ field: "token", message: "Invalid token" }],
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      errors: [{ field: "token", message: "Token expired" }],
    });
  }

  // ── Zod / Custom structured errors already passed ──────
  if (Array.isArray(err.errors)) {
    return res.status(status).json({
      success: false,
      message: err.message || "Validation Error",
      errors: err.errors, // ✅ KEEP AS IS
      ...(isProd ? {} : { stack: err.stack }),
    });
  }

  // ── Fallback ───────────────────────────────────────────
  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: [
      {
        field: "",
        message: err.message || "Something went wrong",
      },
    ],
    ...(isProd ? {} : { stack: err.stack }),
  });
}
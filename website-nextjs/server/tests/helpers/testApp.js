// backend/tests/helpers/testApp.js
/**
 * Creates a fresh Express app instance for integration tests.
 * Avoids port conflicts by NOT calling server.listen().
 * Each test file gets its own app — no shared state.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "../../src/middlewares/rate-limit.middleware.js";
import apiRouter from "../../src/api/index.js";
import errorMiddleware from "../../src/middlewares/error.middleware.js";

export function createTestApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiLimiter);

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", env: "test" });
  });

  // API routes
  app.use("/api", apiRouter);

  // Error handler
  app.use(errorMiddleware);

  return app;
}
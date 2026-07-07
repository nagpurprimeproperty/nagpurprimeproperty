import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { apiLimiter } from './middlewares/rate-limit.middleware.js';
import apiRouter from './api/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import env from './config/env.js';
import cookieParser from 'cookie-parser';

const app = express();

// Security
app.use(helmet());

 
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      const allowedOrigins = env.ALLOWED_ORIGINS
        ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : [];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Performance
app.use(compression());

// Rate limiting
app.use(apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;
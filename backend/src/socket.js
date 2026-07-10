import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './config/env.js';

let io;

/**
 * Initialise Socket.IO on the given HTTP server.
 * Must be called once in server.js before the server starts listening.
 */
const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
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
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT auth middleware ────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized: no token'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id?.toString();
      next();
    } catch {
      next(new Error('Unauthorized: invalid token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    if (!socket.userId) return;

    // Join a private room named after the user's ID
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      socket.leave(socket.userId);
    });
  });

  return io;
};

/**
 * Return the initialised io instance.
 * Throws if init() has not been called yet.
 */
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised — call init(server) first');
  return io;
};

export { init, getIO };

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/api/config';

const getSocketUrl = (): string => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  }
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    return 'http://localhost:4000';
  }
};

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

/**
 * Initialise and connect the Socket.IO client.
 * Authenticates using the user's JWT token.
 * Safe to call multiple times — disconnects old socket first.
 */
export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 10000,
  });

  socket.on('connect', () => {
    if (__DEV__) {
      console.log('[Socket] Connected:', socket?.id);
    }
  });

  socket.on('connect_error', (err) => {
    if (__DEV__) {
      console.error('[Socket] Connection error:', err.message);
    }
  });

  socket.on('disconnect', (reason) => {
    if (__DEV__) {
      console.log('[Socket] Disconnected:', reason);
    }
  });

  return socket;
};

/**
 * Return the current socket instance (may be null if not initialised).
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect and destroy the socket (call on logout).
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

import { createServer } from 'node:http';
import app from './src/app.js';
import env from './src/config/env.js';
import connectDB from './src/config/db.js';
import { closeMailWorker } from './src/workers/mail.worker.js';
import { setTimeout } from 'node:timers/promises';
import { init as initSocket } from './src/socket.js';
import { startSubscriptionNotificationJob } from './src/jobs/subscriptionNotifications.job.js';
import initFirebase from './src/config/firebase.js';
import { startNotificationWatch, stopNotificationWatch } from './src/services/notificationWatch.service.js';

const server = createServer(app);

// Initialise Socket.IO before the server starts listening
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    // Initialise Firebase (needed for FCM)
    initFirebase();

    // Start polling watcher for admin-created notifications (Socket.IO + FCM delivery)
    startNotificationWatch();

    // Start cron jobs
    startSubscriptionNotificationJob();

    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully…`);

  // Stop accepting new connections
  server.close(async () => {
    try {
      stopNotificationWatch();
      // Wait for in-flight mail jobs to finish before disconnecting
      await closeMailWorker();
      console.log('All workers closed. Exiting.');
    } catch (err) {
      console.error('Error during shutdown:', err.message);
    }
    process.exit(0);
  });

  // Force exit after 15 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 15_000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
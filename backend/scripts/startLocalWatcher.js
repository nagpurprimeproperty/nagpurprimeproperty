import mongoose from 'mongoose';
import http from 'http';
import env from '../src/config/env.js';
import initFirebase from '../src/config/firebase.js';
import { startNotificationWatch } from '../src/services/notificationWatch.service.js';
import { init as initSocket } from '../src/socket.js';

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  LOCAL NOTIFICATION WATCHER RUNNER");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Connected.");

    // Initialize Firebase
    initFirebase();
    console.log("✅ Firebase Admin SDK Initialized.");

    // Create a mock HTTP server and initialize Socket.IO on it
    const mockHttpServer = http.createServer();
    initSocket(mockHttpServer);
    console.log("✅ Socket.IO Initialized (Mocked).");

    console.log("\nStarting the Polling Watcher...");
    startNotificationWatch();

    console.log("\n📡 Watcher is active and polling every 3 seconds.");
    console.log("Press Ctrl+C to stop this process.\n");

    // Keep process alive indefinitely
    await new Promise(() => {});
  } catch (err) {
    console.error("🚨 Error starting watcher:", err.message);
    process.exit(1);
  }
}

main();

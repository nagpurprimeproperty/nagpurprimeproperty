import mongoose from "mongoose";
import env from "../src/config/env.js";
import Notification from "../src/modules/notification/notification.model.js";

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ADMIN PANEL NOTIFICATION SEND SIMULATION");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to Database.\n");

    console.log("Creating database entry exactly matching Admin Panel UI...");
    
    // Simulate what admin-panel-ui's notificationService.create does:
    const notification = await Notification.create({
      title: "Test Notification from Admin Panel 🚀",
      message: "Hello! If you see this, push notifications from the admin panel are working!",
      type: "info",
      targetRole: "all",      // broadcast to all users
      userVisible: true,
      status: "sent",
      sendPush: true,
      deliveredByAdminBackend: true, // Created by admin panel backend
      deliveredByBackend: false,     // Let the backend watcher pick it up and deliver it
      sentAt: new Date()
    });

    console.log(`✅ Notification created successfully!`);
    console.log(`   ID:         ${notification._id}`);
    console.log(`   Title:      "${notification.title}"`);
    console.log(`   sendPush:   ${notification.sendPush}`);
    console.log(`   deliveredByBackend: ${notification.deliveredByBackend}`);
    console.log(`\nWaiting 5 seconds to let the backend watcher process it...`);

    // Wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Re-fetch to see if the watcher updated it
    const updated = await Notification.findById(notification._id).lean();
    console.log("\n--- Verification ---");
    console.log(`deliveredByBackend: ${updated.deliveredByBackend ? "✅ true (Processed by Watcher)" : "❌ false (Watcher ignored it)"}`);
    console.log(`pushSent:           ${updated.pushSent ? "✅ true (FCM push sent)" : "❌ false (FCM push skipped)"}`);
    
    await mongoose.disconnect();
    console.log("\nDisconnected from Database.");
    process.exit(0);
  } catch (err) {
    console.error("Error running simulation:", err);
    process.exit(1);
  }
}

main();

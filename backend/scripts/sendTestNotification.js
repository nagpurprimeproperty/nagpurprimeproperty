import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/user/user.model.js";
import initFirebase from "../src/config/firebase.js";
import { sendNotification } from "../src/services/notificationDelivery.service.js";

async function main() {
  const args = process.argv.slice(2);
  const identifier = args[0]; // mobile number or email or user ID

  if (!identifier) {
    console.error("Please provide a user email or mobile number or ID as an argument.");
    console.log("Usage: node scripts/sendTestNotification.js <email_or_mobile_or_id>");
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to Database.");

    // Initialise Firebase
    initFirebase();

    // Find the user
    let user;
    if (mongoose.isValidObjectId(identifier)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({
        $or: [{ email: identifier }, { mobile: identifier }]
      });
    }

    if (!user) {
      console.error(`User with identifier "${identifier}" not found in DB.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`Found User: ${user.name} (${user.email || 'No email'}, ${user.mobile})`);
    if (!user.fcmToken) {
      console.warn("WARNING: This user does not have an fcmToken set in the database.");
      console.warn("Please log in on the app with this user first to register their device token.");
    } else {
      console.log(`User FCM Token: ${user.fcmToken.slice(0, 15)}...`);
    }

    console.log("Sending test notification...");
    
    // We isolate socket call inside scripts since getIO() requires a running HTTP server
    // Modifying global process environment so Socket IO calls do not crash during standalone execution
    const originalConsoleError = console.error;
    console.error = () => {}; // Mute Socket.IO initialization warnings for standalone execution
    
    const notif = await sendNotification({
      userId: user._id,
      title: "Test Notification 🚀",
      message: "Hello! This is a test notification from the Nagpur Prime Property backend.",
      type: "info",
      metadata: { source: "test_script" }
    });

    console.error = originalConsoleError;

    console.log("Notification entry created in DB:", notif._id);
    console.log("FCM delivery attempt complete.");

    await mongoose.disconnect();
    console.log("Disconnected from Database.");
    process.exit(0);
  } catch (err) {
    console.error("Error sending test notification:", err);
    process.exit(1);
  }
}

main();

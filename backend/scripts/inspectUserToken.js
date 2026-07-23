import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/user/user.model.js";

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  INSPECT USER FCM TOKEN");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected.\n");

    const user = await User.findById("6a54a685fb6fb3cb37d88d1a").lean();
    if (!user) {
      console.log("❌ User 6a54a685fb6fb3cb37d88d1a not found in database.");
    } else {
      console.log(`User ID:    ${user._id}`);
      console.log(`Mobile:     ${user.mobile}`);
      console.log(`FCM Token:  ${user.fcmToken ? user.fcmToken : "❌ None"}`);
      console.log(`Updated At: ${user.updatedAt}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error inspecting user:", err);
    process.exit(1);
  }
}

main();

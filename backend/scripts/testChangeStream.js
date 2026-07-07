import mongoose from "mongoose";
import env from "../src/config/env.js";
import Notification from "../src/modules/notification/notification.model.js";

async function main() {
  try {
    console.log("Connecting to:", env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected successfully!");

    console.log("Testing Change Stream on notifications collection...");
    const changeStream = Notification.watch();
    
    changeStream.on("change", (change) => {
      console.log("Change detected:", change);
    });

    console.log("Change Stream started successfully! Your MongoDB supports Change Streams ✅");
    
    // Clean up
    await changeStream.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Change Stream is NOT supported on your database ❌");
    console.error("Error details:", err.message);
    process.exit(1);
  }
}

main();

/**
 * Diagnostic script to debug the full notification → FCM push flow.
 * Run: node scripts/debugNotificationFlow.js
 */
import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/user/user.model.js";
import Notification from "../src/modules/notification/notification.model.js";
import initFirebase, { getMessaging } from "../src/config/firebase.js";

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  NOTIFICATION → FCM PUSH DIAGNOSTIC");
  console.log("═══════════════════════════════════════════════════════════\n");

  // ── Step 1: Database connection ──────────────────────────────────────────
  console.log("Step 1: Connecting to MongoDB...");
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("  ✅ MongoDB connected\n");
  } catch (err) {
    console.error("  ❌ MongoDB connection FAILED:", err.message);
    process.exit(1);
  }

  // ── Step 2: Firebase initialization ──────────────────────────────────────
  console.log("Step 2: Initializing Firebase Admin SDK...");
  try {
    initFirebase();
    const messaging = getMessaging();
    console.log("  ✅ Firebase Admin SDK initialized");
    console.log("  ✅ Firebase Messaging instance ready\n");
  } catch (err) {
    console.error("  ❌ Firebase init FAILED:", err.message);
    console.error("  → Check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.development");
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Step 3: Check users with FCM tokens ──────────────────────────────────
  console.log("Step 3: Checking users with FCM tokens...");
  const usersWithTokens = await User.find({ fcmToken: { $ne: null } }).select("name mobile email fcmToken");
  if (usersWithTokens.length === 0) {
    console.error("  ❌ NO users have fcmToken set in the database!");
    console.error("  → You must log in on the mobile app first to register the device token.");
    console.error("  → After logging in, the fcmToken should appear in the User document.\n");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`  ✅ Found ${usersWithTokens.length} user(s) with FCM tokens:`);
  for (const u of usersWithTokens) {
    console.log(`     • ${u.name} (${u.mobile || u.email}) → token: ${u.fcmToken.slice(0, 20)}...`);
  }
  console.log();

  // ── Step 4: Check recent notifications from admin panel ──────────────────
  console.log("Step 4: Checking last 5 notifications in database...");
  const recentNotifs = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (recentNotifs.length === 0) {
    console.log("  ⚠️  No notifications found in database.\n");
  } else {
    for (const n of recentNotifs) {
      console.log(`  ─────────────────────────────────────`);
      console.log(`  Title:             ${n.title}`);
      console.log(`  Target Role:       ${n.targetRole}`);
      console.log(`  userId:            ${n.userId || "(not set — broadcast)"}`);
      console.log(`  sendPush:          ${n.sendPush === true ? "✅ true" : "❌ " + String(n.sendPush)}`);
      console.log(`  deliveredByBackend:${n.deliveredByBackend === true ? " ✅ true (already processed)" : " ❌ " + String(n.deliveredByBackend)}`);
      console.log(`  pushSent:          ${n.pushSent}`);
      console.log(`  createdAt:         ${n.createdAt}`);
    }
    console.log(`  ─────────────────────────────────────\n`);
  }

  // ── Step 5: Test FCM send to first user ──────────────────────────────────
  const testUser = usersWithTokens[0];
  console.log(`Step 5: Sending a real FCM test push to ${testUser.name} (${testUser.mobile || testUser.email})...`);
  try {
    const messaging = getMessaging();
    const result = await messaging.send({
      token: testUser.fcmToken,
      notification: {
        title: "🔔 Diagnostic Test",
        body: "If you see this push notification, Firebase FCM is working correctly!",
      },
      data: { type: "info", source: "diagnostic" },
      android: { priority: "high" },
      apns: { payload: { aps: { contentAvailable: true, badge: 1 } } },
    });
    console.log(`  ✅ FCM push sent successfully! Message ID: ${result}\n`);
  } catch (err) {
    const code = err?.code || err?.errorInfo?.code || "";
    console.error(`  ❌ FCM push FAILED!`);
    console.error(`  Error code: ${code}`);
    console.error(`  Error message: ${err.message}`);
    if (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token")) {
      console.error(`  → The FCM token is INVALID or EXPIRED. The user needs to log out and log back in on the app.`);
    } else if (code.includes("INVALID_ARGUMENT")) {
      console.error(`  → The FCM token format is wrong. Check if the token was saved correctly.`);
    } else {
      console.error(`  → Check your Firebase Service Account credentials.`);
    }
    console.log();
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  DIAGNOSTIC SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");
  
  const hasTokens = usersWithTokens.length > 0;
  const hasSendPush = recentNotifs.some(n => n.sendPush === true);
  const hasUnprocessed = recentNotifs.some(n => !n.deliveredByBackend);

  console.log(`  MongoDB:            ✅ Connected`);
  console.log(`  Firebase:           ✅ Initialized`);
  console.log(`  Users with tokens:  ${hasTokens ? "✅" : "❌"} ${usersWithTokens.length} user(s)`);
  console.log(`  sendPush=true:      ${hasSendPush ? "✅ Found" : "❌ NONE of the recent notifications have sendPush=true"}`);
  console.log(`  Unprocessed notifs: ${hasUnprocessed ? "⚠️  Found (Change Stream may not be running)" : "✅ All processed"}`);
  
  if (!hasSendPush) {
    console.log();
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │  PROBLEM: sendPush is NOT being saved to MongoDB!   │");
    console.log("  │                                                      │");
    console.log("  │  The admin panel's Notification model is likely      │");
    console.log("  │  missing the 'sendPush' field in its Mongoose       │");
    console.log("  │  schema, so Mongoose strips it out during create(). │");
    console.log("  │                                                      │");
    console.log("  │  FIX: Add this to the admin panel's notification    │");
    console.log("  │  model schema:                                       │");
    console.log("  │    sendPush: { type: Boolean, default: false },     │");
    console.log("  │                                                      │");
    console.log("  │  AND ensure notification.service.js passes it:      │");
    console.log("  │    Notification.create({ ...data, sendPush })       │");
    console.log("  └──────────────────────────────────────────────────────┘");
  }

  console.log();
  await mongoose.disconnect();
  process.exit(0);
}

main();

// backend/tests/helpers/testDb.js
/**
 * Shared MongoDB connection helpers for integration tests.
 * Uses the MONGO_URI from process.env (set in CI to a test database).
 */

import mongoose from "mongoose";

export async function connectTestDb() {
  const uri =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/nagpur_property_test";

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  }
}

export async function disconnectTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function clearCollections(...models) {
  for (const model of models) {
    await model.deleteMany({});
  }
}
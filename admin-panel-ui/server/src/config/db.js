import mongoose from 'mongoose';
import env from './env.js';

/**
 * Singleton MongoDB connection for Next.js (App Router).
 *
 * In Next.js dev mode, modules are re-evaluated on every hot-reload.
 * Without the global cache, each reload would create a new connection
 * and quickly exhaust the MongoDB connection pool.
 *
 * In production/serverless, each function invocation may spin up a
 * fresh Node.js context — the global object persists across warm invocations.
 */

/** @type {{ conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }} */
const cached = global._mongooseConnection ?? { conn: null, promise: null };
global._mongooseConnection = cached;

const connectDB = async () => {
  // Already connected — reuse
  if (cached.conn) {
    return cached.conn;
  }

  // Connection attempt already in flight — wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGO_URI, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log(`MongoDB Connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        // Reset so the next call can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

mongoose.connection.on('error', (err) => {
  console.error('🚨 Mongoose error:', err);
});

mongoose.connection.on('disconnected', () => {
  // Reset cache so next request triggers a reconnect
  cached.conn    = null;
  cached.promise = null;
  console.warn('⚠️ Mongoose disconnected — will reconnect on next request');
});

export default connectDB;
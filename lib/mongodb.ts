/**
 * lib/mongodb.ts
 * Mongoose connection singleton.
 * In Next.js dev mode, hot-reload can create multiple connections.
 * We cache the connection on the global object to prevent that.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env"
  );
}

/* ------------------------------------------------------------------ */
// Extend the NodeJS global type to include our mongoose cache
/* ------------------------------------------------------------------ */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialise cache if it doesn't exist
if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const cached = global.mongooseCache;

export async function connectToDatabase() {
  // Return cached connection if already established
  if (cached.conn) return cached.conn;

  // Create a new connection promise if one isn't pending
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

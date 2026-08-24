import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "eagle_revolution";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    console.warn('MongoDB URI is not defined, skipping database connection.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || MONGODB_DB,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging build
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error('Failed to connect to MongoDB:', err?.message || err);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error awaiting MongoDB connection:', e);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;

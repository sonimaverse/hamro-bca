import mongoose from 'mongoose';

let isConnected = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('username:password')) {
    connectionError = 'MONGODB_URI is not configured in .env.local. Running with in-memory persistence store.';
    return null;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB Atlas';
    console.warn(`[MongoDB] Atlas connection warning: ${connectionError}. Operating with resilient fallback store.`);
    return null;
  }
}

export function getDBStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    hasUri: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('username:password')),
    error: connectionError,
  };
}

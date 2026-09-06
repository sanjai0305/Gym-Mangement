import mongoose from 'mongoose';

interface DbConnectionState {
  isConnected: boolean;
  uri: string;
  error: string | null;
}

const state: DbConnectionState = {
  isConnected: false,
  uri: '',
  error: null,
};

// Global connection promise cache for serverless container reuse
let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<boolean> {
  // Check if mongoose already has an active connection (readyState 1 = connected, 2 = connecting)
  if (mongoose.connection.readyState === 1) {
    state.isConnected = true;
    state.error = null;
    return true;
  }

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://sanjaim0940r_db_user:sanjaiY@cluster0.badefjv.mongodb.net/fitcore?retryWrites=true&w=majority&appName=Cluster0';

  state.uri = mongoUri;

  if (cachedPromise) {
    try {
      await cachedPromise;
      state.isConnected = Number(mongoose.connection.readyState) === 1;
      return state.isConnected;
    } catch (err: any) {
      cachedPromise = null;
      state.isConnected = false;
      state.error = err.message || 'Cached connection failed';
      return false;
    }
  }

  const sanitizedUri = mongoUri.replace(/:([^:@]{3,})@/, ':***@');
  console.log(`[Database] Establishing cached MongoDB connection to ${sanitizedUri}...`);

  cachedPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
    bufferCommands: false,
  });

  try {
    await cachedPromise;
    state.isConnected = true;
    state.error = null;
    console.log('[Database] MongoDB connection established successfully');
    return true;
  } catch (err: any) {
    cachedPromise = null;
    state.isConnected = false;
    state.error = err.message || 'Connection failed';
    console.warn(`[Database] MongoDB connection notice: ${err.message}`);
    console.log('[Database] Operating with resilient embedded storage fallback for uninterrupted service.');
    return false;
  }
}

export function getDatabaseStatus(): DbConnectionState {
  return {
    isConnected: mongoose.connection.readyState === 1 || state.isConnected,
    uri: state.uri,
    error: state.error,
  };
}

export default connectDatabase;

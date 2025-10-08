//src/config/mongo.ts
import mongoose from 'mongoose';

const {
  MONGO_URI = '',
  MONGO_DB_NAME,
  NODE_ENV = 'development'
} = process.env;

type GlobalWithMongo = typeof global & {
  __mongooseConn?: typeof mongoose | null;
  __mongoosePromise?: Promise<typeof mongoose> | null;
};

// cache global para evitar múltiplas conexões em hot-reload (dev)
const g = global as GlobalWithMongo;

mongoose.set('strictQuery', true);

function buildOptions(): Parameters<typeof mongoose.connect>[1] {
  return {
    dbName: MONGO_DB_NAME,
    maxPoolSize: 10,
    autoIndex: NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000
  };
}

function attachConnectionLogs(conn: typeof mongoose.connection) {
  conn.on('connected', () => {
    console.log('[mongo] connected');
  });
  conn.on('error', (err) => {
    console.error('[mongo] connection error:', err);
  });
  conn.on('disconnected', () => {
    console.warn('[mongo] disconnected');
  });
}

/**
 * Conecta ao MongoDB (Atlas/local) usando cache global em dev.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (!MONGO_URI) {
    throw new Error('Missing MONGO_URI in environment variables');
  }

  if (NODE_ENV !== 'production') {
    if (g.__mongooseConn) {
      return g.__mongooseConn;
    }
    if (!g.__mongoosePromise) {
      g.__mongoosePromise = mongoose.connect(MONGO_URI, buildOptions());
    }
    const conn = await g.__mongoosePromise;
    attachConnectionLogs(mongoose.connection);
    g.__mongooseConn = conn;
    return conn;
  }

  // produção: sem cache global
  const conn = await mongoose.connect(MONGO_URI, buildOptions());
  attachConnectionLogs(mongoose.connection);
  return conn;
}

/**
 * Fecha a conexão — útil para testes/Jest e shutdown gracioso.
 */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (NODE_ENV !== 'production') {
    g.__mongooseConn = null;
    g.__mongoosePromise = null;
  }
}

/**
 * Hook de encerramento gracioso do processo.
 */
function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    try {
      await disconnectMongo();
      console.log(`[mongo] closed on ${signal}`);
    } catch (err) {
      console.error('[mongo] error on shutdown', err);
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

// inicializa os hooks uma única vez
setupGracefulShutdown();
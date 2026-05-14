import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

export const config = {
  explorer: {
    url: process.env.EXPLORER_URL || 'https://explorer.bitcoin-classic.net',
    timeout: parseInt(process.env.EXPLORER_TIMEOUT || '60000'),
    maxRetries: parseInt(process.env.EXPLORER_MAX_RETRIES || '5'),
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'btcc_explorer',
    user: process.env.DB_USER || 'btcc',
    password: process.env.DB_PASSWORD || 'btccpassword',
    max: parseInt(process.env.DB_POOL_MAX || '10'),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  indexer: {
    pollInterval: parseInt(process.env.POLL_INTERVAL || '5000'),   // ms
    batchSize: parseInt(process.env.BATCH_SIZE || '10'),
    startHeight: parseInt(process.env.START_HEIGHT || '0'),
    concurrency: parseInt(process.env.CONCURRENCY || '3'),
  },
};

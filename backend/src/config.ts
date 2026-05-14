import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const config = {
  port: parseInt(process.env.API_PORT || '3001'),
  host: process.env.API_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'btcc_explorer',
    user: process.env.DB_USER || 'btcc',
    password: process.env.DB_PASSWORD || 'btccpassword',
    max: parseInt(process.env.DB_POOL_MAX || '20'),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '200'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // ms
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '10'),
    ttlLong: parseInt(process.env.CACHE_TTL_LONG || '300'),
  },
};

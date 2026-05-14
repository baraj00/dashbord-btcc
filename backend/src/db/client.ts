import { Pool } from 'pg';
import { config } from '../config';
import { logger } from '../logger';

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: config.db.max,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        max: config.db.max,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      },
);

pool.on('error', (err) => {
  logger.error('DB pool error', { error: err.message });
});

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
) {
  return pool.query<T>(sql, params);
}

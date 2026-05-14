import { Pool, PoolClient, QueryResultRow } from 'pg';
import { config } from '../config';
import { logger } from '../logger';

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: config.db.max,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
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
  logger.error('Unexpected DB pool error', { error: err.message });
});

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function query<T extends QueryResultRow = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
) {
  return pool.query<T>(sql, params);
}

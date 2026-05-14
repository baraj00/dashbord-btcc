import fs from 'fs';
import path from 'path';
import { pool } from './client';
import { logger } from '../logger';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    logger.info(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    logger.info(`Migration complete: ${file}`);
  }

  await pool.end();
  logger.info('All migrations applied successfully');
}

runMigrations().catch((err) => {
  logger.error('Migration failed', { error: err.message });
  process.exit(1);
});

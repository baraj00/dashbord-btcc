import { BlockIndexer } from './indexer/blockIndexer';
import { MempoolIndexer } from './indexer/mempoolIndexer';
import { pool } from './db/client';
import { redis } from './redis/client';
import { explorer } from './explorer/client';
import { logger } from './logger';

async function main() {
  logger.info('BTCC Indexer starting…');

  // Test explorer connection
  const alive = await explorer.ping();
  if (!alive) {
    logger.warn('Explorer API unreachable — will keep retrying during indexing');
  } else {
    logger.info('Explorer API connection OK');
  }

  await redis.connect();

  const blockIndexer = new BlockIndexer();
  const mempoolIndexer = new MempoolIndexer();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down`);
    await blockIndexer.stop();
    await mempoolIndexer.stop();
    await pool.end();
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Run both indexers concurrently
  await Promise.all([blockIndexer.start(), mempoolIndexer.start()]);
}

main().catch((err) => {
  logger.error('Fatal indexer error', { error: err.message });
  process.exit(1);
});

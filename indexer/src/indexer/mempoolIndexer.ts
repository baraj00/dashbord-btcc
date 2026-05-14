import { logger } from '../logger';

/**
 * The public BTCC explorer does not expose a mempool endpoint.
 * This stub keeps the process alive without erroring.
 * Mempool data will remain empty in the DB.
 */
export class MempoolIndexer {
  private running = false;

  async start(): Promise<void> {
    this.running = true;
    logger.info('Mempool indexer started (stub — no mempool API on public explorer)');
    while (this.running) {
      await new Promise((r) => setTimeout(r, 60_000));
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    logger.info('Mempool indexer stopped');
  }
}

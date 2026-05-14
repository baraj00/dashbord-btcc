import { FastifyInstance } from 'fastify';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';
import { BTCC } from '../../shared/constants';

export async function statsRouter(app: FastifyInstance) {
  app.get('/stats', async (_req, reply) => {
    const data = await cached('btcc:stats', config.cache.ttl, async () => {
      const [blockRes, miningRes, mempoolRes, supplyRes] = await Promise.all([
        query(`
          SELECT height, hash, difficulty, time
          FROM blocks
          ORDER BY height DESC
          LIMIT 1
        `),
        query(`
          SELECT AVG(difficulty) AS avg_difficulty,
                 AVG(size)       AS avg_size,
                 SUM(tx_count)   AS total_txs
          FROM blocks
          WHERE height > (SELECT MAX(height) - 144 FROM blocks)
        `),
        query('SELECT COUNT(*) AS mempool_size, SUM(vsize) AS mempool_bytes FROM mempool'),
        query('SELECT SUM(value) AS circulating FROM tx_outputs WHERE spent = false'),
      ]);

      const best = blockRes.rows[0];
      const mining = miningRes.rows[0];
      const mempool = mempoolRes.rows[0];

      if (!best) {
        return {
          blockcount: 0,
          bestblockhash: '',
          difficulty: 0,
          hashrate: '0',
          connections: 0,
          mempool_size: 0,
          mempool_bytes: 0,
          total_supply: BTCC.TOTAL_SUPPLY.toString(),
          block_reward: BTCC.INITIAL_REWARD.toString(),
          next_halving_block: BTCC.HALVING_INTERVAL,
          blocks_until_halving: BTCC.HALVING_INTERVAL,
          avg_block_time: BTCC.TARGET_BLOCK_TIME,
          avg_fee_rate: '0',
        };
      }

      const height = best.height as number;
      const era = Math.floor(height / BTCC.HALVING_INTERVAL);
      const blockReward = BTCC.INITIAL_REWARD / 2 ** era;
      const nextHalving = (era + 1) * BTCC.HALVING_INTERVAL;
      const blocksUntilHalving = nextHalving - height;

      // Hashrate estimate: difficulty * 2^32 / 600
      const difficulty = best.difficulty as number;
      const hashrate = Math.round((difficulty * 4294967296) / 600);

      return {
        blockcount: height,
        bestblockhash: best.hash,
        difficulty,
        hashrate: hashrate.toString(),
        connections: 0, // requires live RPC
        mempool_size: parseInt(mempool.mempool_size as string, 10),
        mempool_bytes: parseInt((mempool.mempool_bytes as string) || '0', 10),
        total_supply: (BTCC.TOTAL_SUPPLY * BTCC.SATOSHIS_PER_BTC).toString(),
        block_reward: (blockReward * BTCC.SATOSHIS_PER_BTC).toString(),
        next_halving_block: nextHalving,
        blocks_until_halving: blocksUntilHalving,
        avg_block_time: BTCC.TARGET_BLOCK_TIME,
        avg_fee_rate: '1',
      };
    });

    return reply.send(data);
  });
}

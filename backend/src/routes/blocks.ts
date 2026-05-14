import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
});

export async function blocksRouter(app: FastifyInstance) {
  // GET /api/blocks — paginated list
  app.get('/blocks', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const cacheKey = `btcc:blocks:${page}:${limit}`;
    const data = await cached(cacheKey, config.cache.ttl, async () => {
      const [rowsRes, countRes] = await Promise.all([
        query(
          `SELECT hash, height, time, tx_count, size, weight, difficulty,
                  total_fees, reward, confirmations
           FROM blocks
           ORDER BY height DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset],
        ),
        query('SELECT COUNT(*) AS total FROM blocks'),
      ]);
      const total = parseInt(countRes.rows[0].total as string, 10);
      return {
        data: rowsRes.rows,
        total,
        page,
        limit,
        has_more: offset + limit < total,
      };
    });

    return reply.send(data);
  });

  // GET /api/block/:hash
  app.get<{ Params: { hash: string } }>('/block/:hash', async (req, reply) => {
    const { hash } = req.params;

    // Support lookup by height too
    const isHeight = /^\d+$/.test(hash);
    const cacheKey = `btcc:block:${hash}`;

    const data = await cached(cacheKey, config.cache.ttl, async () => {
      let blockRes;
      if (isHeight) {
        blockRes = await query(
          'SELECT * FROM blocks WHERE height = $1',
          [parseInt(hash, 10)],
        );
      } else {
        blockRes = await query('SELECT * FROM blocks WHERE hash = $1', [hash]);
      }

      if (blockRes.rows.length === 0) return null;
      const block = blockRes.rows[0];

      // Fetch txs for this block (abbreviated)
      const txRes = await query(
        `SELECT txid, is_coinbase, fee, total_output, time
         FROM transactions
         WHERE blockhash = $1
         ORDER BY is_coinbase DESC, fee DESC
         LIMIT 100`,
        [block.hash],
      );

      return { ...block, transactions: txRes.rows };
    });

    if (!data) return reply.status(404).send({ error: 'Block not found' });
    return reply.send(data);
  });
}

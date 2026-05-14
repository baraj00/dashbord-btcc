import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.enum(['fee_rate', 'fee', 'size', 'time']).default('fee_rate'),
});

export async function mempoolRouter(app: FastifyInstance) {
  app.get('/mempool', async (req, reply) => {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query' });
    }
    const { page, limit, sort } = parsed.data;
    const offset = (page - 1) * limit;

    const allowedSorts: Record<string, string> = {
      fee_rate: 'fee_rate DESC',
      fee: 'fee DESC',
      size: 'vsize DESC',
      time: 'time DESC',
    };
    const orderBy = allowedSorts[sort] ?? 'fee_rate DESC';

    const cacheKey = `btcc:mempool:${page}:${limit}:${sort}`;
    const data = await cached(cacheKey, 5, async () => {
      const [rowsRes, countRes] = await Promise.all([
        query(
          `SELECT txid, size, vsize, weight, fee, fee_rate, time, depends
           FROM mempool
           ORDER BY ${orderBy}
           LIMIT $1 OFFSET $2`,
          [limit, offset],
        ),
        query('SELECT COUNT(*) AS total, SUM(vsize) AS total_vsize FROM mempool'),
      ]);

      const total = parseInt(countRes.rows[0].total as string, 10);
      return {
        data: rowsRes.rows,
        total,
        total_vsize: parseInt((countRes.rows[0].total_vsize as string) || '0', 10),
        page,
        limit,
        has_more: offset + limit < total,
      };
    });

    return reply.send(data);
  });
}

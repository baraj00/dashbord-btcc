import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function richlistRouter(app: FastifyInstance) {
  app.get('/richlist', async (req, reply) => {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query' });
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const cacheKey = `btcc:richlist:${page}:${limit}`;
    const data = await cached(cacheKey, config.cache.ttlLong, async () => {
      const [rowsRes, countRes, totalRes] = await Promise.all([
        query(
          `SELECT address, balance, total_received, total_sent, tx_count,
                  ROW_NUMBER() OVER (ORDER BY balance DESC) AS rank
           FROM addresses
           WHERE balance > 0
           ORDER BY balance DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset],
        ),
        query('SELECT COUNT(*) AS total FROM addresses WHERE balance > 0'),
        query('SELECT SUM(balance) AS total_supply FROM addresses WHERE balance > 0'),
      ]);

      const total = parseInt(countRes.rows[0].total as string, 10);
      const totalSupply = BigInt(
        (totalRes.rows[0].total_supply as string) || '0',
      );

      const data = rowsRes.rows.map((row) => ({
        ...row,
        percent:
          totalSupply > BigInt(0)
            ? (Number(BigInt(row.balance as string) * BigInt(10000)) / Number(totalSupply)) / 100
            : 0,
      }));

      return {
        data,
        total,
        page,
        limit,
        has_more: offset + limit < total,
      };
    });

    return reply.send(data);
  });
}

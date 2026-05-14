import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(25),
});

export async function addressesRouter(app: FastifyInstance) {
  // GET /api/address/:address
  app.get<{ Params: { address: string } }>('/address/:address', async (req, reply) => {
    const { address } = req.params;

    // Basic length validation
    if (!address || address.length < 10 || address.length > 100) {
      return reply.status(400).send({ error: 'Invalid address' });
    }

    const cacheKey = `btcc:addr:${address}`;
    const data = await cached(cacheKey, config.cache.ttl, async () => {
      const addrRes = await query(
        'SELECT * FROM addresses WHERE address = $1',
        [address],
      );
      if (addrRes.rows.length === 0) return null;
      return addrRes.rows[0];
    });

    if (!data) return reply.status(404).send({ error: 'Address not found' });
    return reply.send(data);
  });

  // GET /api/address/:address/txs — paginated transactions for address
  app.get<{ Params: { address: string } }>(
    '/address/:address/txs',
    async (req, reply) => {
      const { address } = req.params;
      if (!address || address.length < 10 || address.length > 100) {
        return reply.status(400).send({ error: 'Invalid address' });
      }

      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Invalid query' });
      }
      const { page, limit } = parsed.data;
      const offset = (page - 1) * limit;

      const cacheKey = `btcc:addr:${address}:txs:${page}:${limit}`;
      const data = await cached(cacheKey, config.cache.ttl, async () => {
        // Aggregate txs where address appears in inputs or outputs
        const [rowsRes, countRes] = await Promise.all([
          query(
            `SELECT DISTINCT t.txid, t.blockheight, t.blockhash, t.blocktime,
                    t.fee, t.is_coinbase, t.time
             FROM transactions t
             WHERE t.txid IN (
               SELECT txid FROM tx_outputs WHERE address = $1
               UNION
               SELECT txid FROM tx_inputs WHERE address = $1
             )
             ORDER BY t.time DESC
             LIMIT $2 OFFSET $3`,
            [address, limit, offset],
          ),
          query(
            `SELECT COUNT(DISTINCT t.txid) AS total
             FROM transactions t
             WHERE t.txid IN (
               SELECT txid FROM tx_outputs WHERE address = $1
               UNION
               SELECT txid FROM tx_inputs WHERE address = $1
             )`,
            [address],
          ),
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
    },
  );

  // GET /api/address/:address/utxos
  app.get<{ Params: { address: string } }>(
    '/address/:address/utxos',
    async (req, reply) => {
      const { address } = req.params;
      if (!address || address.length < 10 || address.length > 100) {
        return reply.status(400).send({ error: 'Invalid address' });
      }

      const cacheKey = `btcc:addr:${address}:utxos`;
      const data = await cached(cacheKey, config.cache.ttl, async () => {
        const res = await query(
          `SELECT o.txid, o.index_n, o.value, t.blockheight, t.blocktime
           FROM tx_outputs o
           JOIN transactions t ON t.txid = o.txid
           WHERE o.address = $1 AND o.spent = false
           ORDER BY t.blockheight DESC`,
          [address],
        );
        return res.rows;
      });

      return reply.send(data);
    },
  );
}

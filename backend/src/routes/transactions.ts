import { FastifyInstance } from 'fastify';
import { query } from '../db/client';
import { cached } from '../redis/client';
import { config } from '../config';

export async function transactionsRouter(app: FastifyInstance) {
  // GET /api/tx/:hash
  app.get<{ Params: { hash: string } }>('/tx/:hash', async (req, reply) => {
    const { hash } = req.params;
    const cacheKey = `btcc:tx:${hash}`;

    const data = await cached(cacheKey, config.cache.ttl, async () => {
      const txRes = await query(
        'SELECT * FROM transactions WHERE txid = $1',
        [hash],
      );
      if (txRes.rows.length === 0) return null;

      const tx = txRes.rows[0];

      const [inputsRes, outputsRes] = await Promise.all([
        query(
          `SELECT i.*, o.address AS prev_address, o.value AS prev_value
           FROM tx_inputs i
           LEFT JOIN tx_outputs o ON o.txid = i.prev_txid AND o.index_n = i.prev_vout
           WHERE i.txid = $1
           ORDER BY i.index_n`,
          [hash],
        ),
        query(
          'SELECT * FROM tx_outputs WHERE txid = $1 ORDER BY index_n',
          [hash],
        ),
      ]);

      return {
        ...tx,
        vin: inputsRes.rows,
        vout: outputsRes.rows,
      };
    });

    if (!data) return reply.status(404).send({ error: 'Transaction not found' });
    return reply.send(data);
  });
}

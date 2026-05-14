import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import { config } from './config';
import { logger } from './logger';
import { redis } from './redis/client';
import { pool } from './db/client';
import { blocksRouter } from './routes/blocks';
import { transactionsRouter } from './routes/transactions';
import { addressesRouter } from './routes/addresses';
import { statsRouter } from './routes/stats';
import { mempoolRouter } from './routes/mempool';
import { richlistRouter } from './routes/richlist';
import { websocketRouter, startBroadcaster } from './websocket/server';

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  // ── Security ──────────────────────────────────────────────────────────────
  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'OPTIONS'],
  });

  await app.register(compress, { global: true });

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    redis: redis as Parameters<typeof rateLimit>[1] extends { redis?: infer R } ? R : never,
    keyGenerator: (req) =>
      (req.headers['x-forwarded-for'] as string) || req.ip,
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      code: 429,
      message: 'Rate limit exceeded. Please slow down.',
    }),
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────
  await app.register(websocket);

  // ── Routes ────────────────────────────────────────────────────────────────
  app.register(
    async (instance) => {
      await blocksRouter(instance);
      await transactionsRouter(instance);
      await addressesRouter(instance);
      await statsRouter(instance);
      await mempoolRouter(instance);
      await richlistRouter(instance);
      await websocketRouter(instance);
    },
    { prefix: '/api' },
  );

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    service: 'btcc-explorer-api',
    timestamp: new Date().toISOString(),
  }));

  // 404
  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ error: 'Not Found', code: 404 });
  });

  // Error handler
  app.setErrorHandler((err, _req, reply) => {
    logger.error('Unhandled request error', { error: err.message });
    reply.status(500).send({ error: 'Internal Server Error', code: 500 });
  });

  return app;
}

async function main() {
  const app = await buildServer();

  await redis.connect();

  try {
    await app.listen({ port: config.port, host: config.host });
    logger.info(`BTCC API running on http://${config.host}:${config.port}`);
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }

  startBroadcaster();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down`);
    await app.close();
    await pool.end();
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal error', { error: err.message });
  process.exit(1);
});

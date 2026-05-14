import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { query } from '../db/client';
import { WS_EVENTS } from '../../shared/constants';

interface WsClient {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
}

const clients = new Map<string, WsClient>();
let clientIdCounter = 0;

function safeSend(ws: WebSocket, payload: string) {
  if (ws.readyState === WebSocket.OPEN) {
    try { ws.send(payload); } catch { /* disconnected */ }
  }
}

export function broadcastEvent(event: string, data: unknown) {
  const payload = JSON.stringify({ event, data, timestamp: Date.now() });
  for (const client of clients.values()) {
    if (client.subscriptions.has(event) || client.subscriptions.has('all')) {
      safeSend(client.ws, payload);
    }
  }
}

export async function websocketRouter(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (connection, _req) => {
    const ws = connection.socket as unknown as WebSocket;
    const id = `client_${++clientIdCounter}`;
    const client: WsClient = {
      id,
      ws,
      subscriptions: new Set(['all']),
      lastPing: Date.now(),
    };
    clients.set(id, client);

    // Send welcome
    safeSend(ws,
      JSON.stringify({
        event: 'connected',
        data: { id, message: 'Connected to BTCC Explorer WebSocket' },
        timestamp: Date.now(),
      }),
    );

    ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          event: string;
          channels?: string[];
        };

        if (msg.event === WS_EVENTS.PING) {
          client.lastPing = Date.now();
          safeSend(ws, JSON.stringify({ event: WS_EVENTS.PONG, timestamp: Date.now() }));
          return;
        }

        if (msg.event === WS_EVENTS.SUBSCRIBE && Array.isArray(msg.channels)) {
          for (const ch of msg.channels) {
            client.subscriptions.add(ch);
          }
          safeSend(ws,
            JSON.stringify({
              event: 'subscribed',
              data: { channels: [...client.subscriptions] },
              timestamp: Date.now(),
            }),
          );
        }

        if (msg.event === WS_EVENTS.UNSUBSCRIBE && Array.isArray(msg.channels)) {
          for (const ch of msg.channels) {
            client.subscriptions.delete(ch);
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(id);
    });

    ws.on('error', () => {
      clients.delete(id);
    });
  });
}

// ── Background broadcaster — polls DB for new blocks every 5s ────────────────

let lastBroadcastHeight = -1;

export async function startBroadcaster() {
  setInterval(async () => {
    try {
      const res = await query(
        'SELECT hash, height, time, tx_count, difficulty, size FROM blocks ORDER BY height DESC LIMIT 1',
      );
      if (res.rows.length === 0) return;

      const block = res.rows[0];
      const height = block.height as number;

      if (height > lastBroadcastHeight) {
        lastBroadcastHeight = height;
        broadcastEvent(WS_EVENTS.NEW_BLOCK, block);
      }

      // Broadcast mempool summary
      const mempoolRes = await query(
        'SELECT COUNT(*) AS size, SUM(fee) AS total_fees FROM mempool',
      );
      broadcastEvent(WS_EVENTS.MEMPOOL_UPDATE, mempoolRes.rows[0]);
    } catch {
      // Suppress broadcast errors
    }
  }, 5000);
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { WS_EVENTS } from '@shared/constants';

type Handler = (data: unknown) => void;

interface WsMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

export function useWebSocket(
  onNewBlock?: Handler,
  onMempoolUpdate?: Handler,
  onStatsUpdate?: Handler,
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true);

  const connect = useCallback(() => {
    if (!mounted.current) return;

    const wsUrl =
      (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001') + '/api/ws';

    try {
      ws.current = new WebSocket(wsUrl);
    } catch {
      scheduleReconnect();
      return;
    }

    ws.current.onopen = () => {
      // Subscribe to channels
      ws.current?.send(
        JSON.stringify({
          event: WS_EVENTS.SUBSCRIBE,
          channels: [
            WS_EVENTS.NEW_BLOCK,
            WS_EVENTS.MEMPOOL_UPDATE,
            WS_EVENTS.STATS_UPDATE,
          ],
        }),
      );
    };

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as WsMessage;
        if (msg.event === WS_EVENTS.NEW_BLOCK) onNewBlock?.(msg.data);
        if (msg.event === WS_EVENTS.MEMPOOL_UPDATE) onMempoolUpdate?.(msg.data);
        if (msg.event === WS_EVENTS.STATS_UPDATE) onStatsUpdate?.(msg.data);
      } catch {
        // Ignore parse errors
      }
    };

    ws.current.onclose = () => {
      scheduleReconnect();
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  }, [onNewBlock, onMempoolUpdate, onStatsUpdate]);

  const scheduleReconnect = useCallback(() => {
    if (!mounted.current) return;
    reconnectTimer.current = setTimeout(connect, 5000);
  }, [connect]);

  useEffect(() => {
    mounted.current = true;
    connect();

    return () => {
      mounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);
}

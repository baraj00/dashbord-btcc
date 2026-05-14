// ─────────────────────────────────────────────────────────────────────────────
//  BTCC Explorer — Shared Constants
// ─────────────────────────────────────────────────────────────────────────────

export const BTCC = {
  TICKER: 'BTCC',
  NAME: 'Bitcoin Classic',
  SATOSHIS_PER_BTC: 100_000_000,
  TOTAL_SUPPLY: 21_000_000,
  INITIAL_REWARD: 50,
  HALVING_INTERVAL: 210_000,
  TARGET_BLOCK_TIME: 600, // seconds (10 min)
  MIN_RELAY_FEE: 1000,    // satoshis
} as const;

export const API_DEFAULTS = {
  PAGE_LIMIT: 25,
  MAX_LIMIT: 100,
  CACHE_TTL: 10,           // seconds — short-lived data
  CACHE_TTL_LONG: 300,     // seconds — stable data
  RATE_LIMIT_WINDOW: 60,   // seconds
  RATE_LIMIT_MAX: 200,     // requests per window
} as const;

export const WS_EVENTS = {
  NEW_BLOCK: 'new_block',
  NEW_TX: 'new_tx',
  MEMPOOL_UPDATE: 'mempool_update',
  STATS_UPDATE: 'stats_update',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PING: 'ping',
  PONG: 'pong',
} as const;

export const DB_TABLES = {
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  INPUTS: 'tx_inputs',
  OUTPUTS: 'tx_outputs',
  ADDRESSES: 'addresses',
  MEMPOOL: 'mempool',
} as const;

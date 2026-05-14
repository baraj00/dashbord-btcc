-- ─────────────────────────────────────────────────────────────────────────────
--  BTCC Explorer — Initial Schema Migration
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Blocks ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocks (
  hash               TEXT        PRIMARY KEY,
  height             INTEGER     NOT NULL,
  version            INTEGER     NOT NULL,
  previousblockhash  TEXT        NOT NULL DEFAULT '',
  merkleroot         TEXT        NOT NULL,
  time               BIGINT      NOT NULL,
  bits               TEXT        NOT NULL,
  nonce              BIGINT      NOT NULL,
  difficulty         DOUBLE PRECISION NOT NULL,
  size               INTEGER     NOT NULL,
  weight             INTEGER     NOT NULL DEFAULT 0,
  tx_count           INTEGER     NOT NULL DEFAULT 0,
  total_fees         BIGINT      NOT NULL DEFAULT 0,
  reward             BIGINT      NOT NULL DEFAULT 0,
  confirmations      INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blocks_height ON blocks(height);
CREATE INDEX IF NOT EXISTS idx_blocks_time ON blocks(time DESC);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  txid          TEXT        PRIMARY KEY,
  blockhash     TEXT        REFERENCES blocks(hash) ON DELETE CASCADE,
  blockheight   INTEGER,
  blocktime     BIGINT,
  size          INTEGER     NOT NULL DEFAULT 0,
  vsize         INTEGER     NOT NULL DEFAULT 0,
  weight        INTEGER     NOT NULL DEFAULT 0,
  fee           BIGINT      NOT NULL DEFAULT 0,
  total_input   BIGINT      NOT NULL DEFAULT 0,
  total_output  BIGINT      NOT NULL DEFAULT 0,
  locktime      INTEGER     NOT NULL DEFAULT 0,
  version       INTEGER     NOT NULL DEFAULT 1,
  is_coinbase   BOOLEAN     NOT NULL DEFAULT false,
  confirmations INTEGER     NOT NULL DEFAULT 0,
  time          BIGINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tx_blockhash   ON transactions(blockhash);
CREATE INDEX IF NOT EXISTS idx_tx_blockheight ON transactions(blockheight DESC);
CREATE INDEX IF NOT EXISTS idx_tx_time        ON transactions(time DESC);

-- ─── Transaction Inputs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tx_inputs (
  id          SERIAL      PRIMARY KEY,
  txid        TEXT        NOT NULL REFERENCES transactions(txid) ON DELETE CASCADE,
  index_n     INTEGER     NOT NULL,
  prev_txid   TEXT,
  prev_vout   INTEGER,
  script_sig  TEXT        NOT NULL DEFAULT '',
  sequence    BIGINT      NOT NULL DEFAULT 0,
  witness     TEXT[]      NOT NULL DEFAULT '{}',
  value       BIGINT,
  address     TEXT,
  coinbase    TEXT,
  UNIQUE (txid, index_n)
);

CREATE INDEX IF NOT EXISTS idx_inputs_txid     ON tx_inputs(txid);
CREATE INDEX IF NOT EXISTS idx_inputs_prev     ON tx_inputs(prev_txid, prev_vout);
CREATE INDEX IF NOT EXISTS idx_inputs_address  ON tx_inputs(address) WHERE address IS NOT NULL;

-- ─── Transaction Outputs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tx_outputs (
  id           SERIAL      PRIMARY KEY,
  txid         TEXT        NOT NULL REFERENCES transactions(txid) ON DELETE CASCADE,
  index_n      INTEGER     NOT NULL,
  value        BIGINT      NOT NULL DEFAULT 0,
  script_pubkey TEXT       NOT NULL DEFAULT '',
  address      TEXT,
  spent        BOOLEAN     NOT NULL DEFAULT false,
  spent_txid   TEXT,
  UNIQUE (txid, index_n)
);

CREATE INDEX IF NOT EXISTS idx_outputs_txid    ON tx_outputs(txid);
CREATE INDEX IF NOT EXISTS idx_outputs_address ON tx_outputs(address) WHERE address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outputs_spent   ON tx_outputs(spent_txid) WHERE spent_txid IS NOT NULL;

-- ─── Addresses ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  address            TEXT        PRIMARY KEY,
  balance            BIGINT      NOT NULL DEFAULT 0,
  total_received     BIGINT      NOT NULL DEFAULT 0,
  total_sent         BIGINT      NOT NULL DEFAULT 0,
  tx_count           INTEGER     NOT NULL DEFAULT 0,
  unconfirmed_balance BIGINT     NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_balance ON addresses(balance DESC);

-- ─── Mempool ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mempool (
  txid       TEXT        PRIMARY KEY,
  size       INTEGER     NOT NULL DEFAULT 0,
  vsize      INTEGER     NOT NULL DEFAULT 0,
  weight     INTEGER     NOT NULL DEFAULT 0,
  fee        BIGINT      NOT NULL DEFAULT 0,
  fee_rate   NUMERIC(18,8) NOT NULL DEFAULT 0,
  time       BIGINT      NOT NULL DEFAULT 0,
  depends    TEXT[]      NOT NULL DEFAULT '{}',
  raw_data   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mempool_fee_rate ON mempool(fee_rate DESC);
CREATE INDEX IF NOT EXISTS idx_mempool_time     ON mempool(time DESC);

-- ─── Indexer State ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS indexer_state (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO indexer_state (key, value)
VALUES ('last_indexed_height', '-1')
ON CONFLICT (key) DO NOTHING;

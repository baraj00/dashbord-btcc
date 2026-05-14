# BTCC Explorer

The **official Bitcoin Classic (BTCC) Blockchain Explorer and Public API** — a production-ready, full-stack explorer built to be the primary reference for the BTCC ecosystem.

Inspired by [mempool.space](https://mempool.space) and [blockchain.com](https://blockchain.com/explorer).

---

## Architecture

```
dashbord/
├── shared/          # Shared TypeScript types & constants
├── indexer/         # Blockchain indexer (syncs BTCC node → PostgreSQL)
├── backend/         # REST API + WebSocket server (Fastify/Node.js)
├── frontend/        # Explorer UI (Next.js 14, TailwindCSS)
└── docker-compose.yml
```

### Services

| Service   | Port  | Tech                    | Purpose                          |
|-----------|-------|-------------------------|----------------------------------|
| Frontend  | 3000  | Next.js 14 + Tailwind   | Explorer UI                      |
| Backend   | 3001  | Fastify + TypeScript    | REST API + WebSocket             |
| Indexer   | —     | Node.js + TypeScript    | Block/tx/mempool ingestion       |
| PostgreSQL| 5432  | PostgreSQL 16           | Primary data store               |
| Redis     | 6379  | Redis 7                 | Cache + rate limiting            |

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- BTCC full node running with RPC enabled

### BTCC Node Configuration (`bitcoin.conf`)

```ini
server=1
rpcuser=btccrpc
rpcpassword=your_secure_rpc_password
rpcallowip=127.0.0.1
rpcport=8332
txindex=1
```

---

## Quick Start (Docker)

```bash
# 1. Clone and enter the project
cd dashbord

# 2. Configure environment
cp .env.example .env
# Edit .env with your RPC credentials and passwords

# 3. Run database migrations
docker compose run --rm indexer node dist/db/migrate.js

# 4. Start all services
docker compose up -d

# 5. Open the explorer
open http://localhost:3000
```

---

## Local Development

### 1. Setup environment

```bash
cp .env.example .env
# Start only infrastructure
docker compose up -d postgres redis
```

### 2. Run database migrations

```bash
cd indexer
npm install
npm run migrate
```

### 3. Start the indexer

```bash
cd indexer
npm run dev
```

### 4. Start the API server

```bash
cd backend
npm install
npm run dev
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## REST API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | `/stats`                    | Network statistics               |
| GET    | `/blocks`                   | Paginated block list             |
| GET    | `/block/:hash`              | Block detail (hash or height)    |
| GET    | `/tx/:hash`                 | Transaction detail               |
| GET    | `/address/:address`         | Address summary                  |
| GET    | `/address/:address/txs`     | Paginated address transactions   |
| GET    | `/address/:address/utxos`   | Address UTXOs                    |
| GET    | `/mempool`                  | Mempool transactions             |
| GET    | `/richlist`                 | Top addresses by balance         |

### Pagination

All list endpoints support:
- `?page=1` — Page number (1-based)
- `?limit=25` — Items per page (max 100)

### Rate Limiting

- 200 requests per minute per IP
- `X-RateLimit-*` headers included in responses

---

## WebSocket API

Connect to: `ws://localhost:3001/api/ws`

### Subscribe to events

```json
{
  "event": "subscribe",
  "channels": ["new_block", "mempool_update", "stats_update"]
}
```

### Event payloads

**`new_block`**
```json
{
  "event": "new_block",
  "data": { "hash": "...", "height": 100000, "tx_count": 42 },
  "timestamp": 1715000000000
}
```

**`mempool_update`**
```json
{
  "event": "mempool_update",
  "data": { "size": 1234, "total_fees": "50000" },
  "timestamp": 1715000000000
}
```

---

## Database Schema

```
blocks          — Block headers
transactions    — Transaction records
tx_inputs       — Transaction inputs (UTXOs spent)
tx_outputs      — Transaction outputs (UTXOs created)
addresses       — Aggregated address balances
mempool         — Unconfirmed transactions
indexer_state   — Indexer sync state
```

---

## Frontend Pages

| Path                  | Description            |
|-----------------------|------------------------|
| `/`                   | Dashboard (live stats) |
| `/blocks`             | Block list             |
| `/blocks/:hash`       | Block detail           |
| `/tx/:hash`           | Transaction detail     |
| `/address/:address`   | Address detail         |
| `/mempool`            | Live mempool view      |
| `/richlist`           | Rich list              |
| `/analytics`          | Charts & analytics     |

---

## Environment Variables

See [.env.example](.env.example) for the full list.

---

## Production Deployment

For production, set:
```env
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
BTCC_RPC_PASSWORD=<strong-password>
DB_PASSWORD=<strong-password>
```

Use a reverse proxy (nginx) to serve both services under the same domain:
- `https://explorer.bitcoin-classic.net` → frontend:3000
- `https://explorer.bitcoin-classic.net/api` → backend:3001

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, SWR, Recharts
- **Backend**: Fastify, TypeScript, WebSocket, Zod
- **Indexer**: Node.js, TypeScript, Bitcoin Core RPC
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **DevOps**: Docker, Docker Compose

---

## License

MIT — Bitcoin Classic Explorer

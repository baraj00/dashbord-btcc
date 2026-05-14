import pLimit from 'p-limit';
import { PoolClient } from 'pg';
import { explorer } from '../explorer/client';
import { pool, withTransaction, query } from '../db/client';
import { redis } from '../redis/client';
import { logger } from '../logger';
import { config } from '../config';
import { BTCC } from '../../shared/constants';
import type { RpcBlock, RpcTransaction, RpcVin, RpcVout } from '../../shared/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function btcToSat(btc: number): bigint {
  return BigInt(Math.round(btc * BTCC.SATOSHIS_PER_BTC));
}

function computeBlockReward(height: number): bigint {
  const era = Math.floor(height / BTCC.HALVING_INTERVAL);
  const reward = BTCC.INITIAL_REWARD / 2 ** era;
  return btcToSat(reward);
}

function extractAddress(vout: RpcVout): string | null {
  const spk = vout.scriptPubKey;
  return spk.address ?? (spk.addresses?.[0] ?? null);
}

// ─── Indexer ─────────────────────────────────────────────────────────────────

export class BlockIndexer {
  private running = false;
  private limit = pLimit(config.indexer.concurrency);
  /** In-memory height → hash cache, populated from Redis + backward chain walks */
  private hashCache = new Map<number, string>();

  async getLastIndexedHeight(): Promise<number> {
    const res = await query<{ value: string }>(
      "SELECT value FROM indexer_state WHERE key = 'last_indexed_height'",
    );
    return parseInt(res.rows[0]?.value ?? '-1', 10);
  }

  private async setLastIndexedHeight(
    client: PoolClient,
    height: number,
  ): Promise<void> {
    await client.query(
      `UPDATE indexer_state SET value = $1, updated_at = now()
       WHERE key = 'last_indexed_height'`,
      [height.toString()],
    );
  }

  async isBlockIndexed(hash: string): Promise<boolean> {
    const res = await query('SELECT 1 FROM blocks WHERE hash = $1', [hash]);
    return res.rowCount! > 0;
  }

  // ── Index a single block ──────────────────────────────────────────────────

  async indexBlockByHash(height: number, hash: string): Promise<void> {
    if (await this.isBlockIndexed(hash)) {
      logger.debug(`Block already indexed: ${height}`);
      await withTransaction(async (client) => this.setLastIndexedHeight(client, height));
      return;
    }

    logger.info(`Indexing block ${height} (${hash.slice(0, 16)}...)`);
    const block = await explorer.getBlock(hash);

    await withTransaction(async (client) => {
      await this.insertBlock(client, block);
      await this.insertTransactions(client, block);
      await this.setLastIndexedHeight(client, height);
    });

    logger.info(`Block ${height} indexed: ${block.nTx} txs`);
  }

  private async insertBlock(client: PoolClient, block: RpcBlock): Promise<void> {
    const txs = block.tx as RpcTransaction[];
    const txCount = txs.length;
    const coinbaseTx = txs[0];

    // Compute fees: sum of all non-coinbase tx fees
    let totalFees = BigInt(0);
    for (let i = 1; i < txs.length; i++) {
      const tx = txs[i];
      const inputSum = tx.vin.reduce((_acc: bigint, _vin: RpcVin) => {
        // We'll compute fees properly during tx insert; rough estimate here
        return _acc;
      }, BigInt(0));
    }

    const reward = computeBlockReward(block.height);

    await client.query(
      `INSERT INTO blocks
        (hash, height, version, previousblockhash, merkleroot, time, bits,
         nonce, difficulty, size, weight, tx_count, total_fees, reward, confirmations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (hash) DO UPDATE SET confirmations = EXCLUDED.confirmations`,
      [
        block.hash,
        block.height,
        block.version,
        block.previousblockhash ?? '',
        block.merkleroot,
        block.time,
        block.bits,
        block.nonce,
        block.difficulty,
        block.size,
        block.weight ?? 0,
        txCount,
        totalFees.toString(),
        reward.toString(),
        block.confirmations,
      ],
    );
  }

  private async insertTransactions(
    client: PoolClient,
    block: RpcBlock,
  ): Promise<void> {
    const txs = block.tx as RpcTransaction[];
    let blockFees = BigInt(0);

    for (const tx of txs) {
      const fee = await this.insertTransaction(client, tx, block);
      blockFees += fee;
    }

    // Update block with accurate total fees
    await client.query(
      'UPDATE blocks SET total_fees = $1 WHERE hash = $2',
      [blockFees.toString(), block.hash],
    );
  }

  private async insertTransaction(
    client: PoolClient,
    tx: RpcTransaction,
    block: RpcBlock,
  ): Promise<bigint> {
    const isCoinbase = tx.vin.length === 1 && !!tx.vin[0].coinbase;

    // Compute output total
    const totalOutput = tx.vout.reduce(
      (acc: bigint, vout: RpcVout) => acc + btcToSat(vout.value),
      BigInt(0),
    );

    // Compute input total (requires fetching prev txs for non-coinbase)
    let totalInput = BigInt(0);
    if (!isCoinbase) {
      for (const vin of tx.vin) {
        if (vin.txid) {
          const res = await client.query<{ value: string }>(
            'SELECT value FROM tx_outputs WHERE txid = $1 AND index_n = $2',
            [vin.txid, vin.vout],
          );
          if (res.rows[0]) {
            totalInput += BigInt(res.rows[0].value);
          }
        }
      }
    }

    const fee = isCoinbase ? BigInt(0) : totalInput - totalOutput;

    await client.query(
      `INSERT INTO transactions
        (txid, blockhash, blockheight, blocktime, size, vsize, weight, fee,
         total_input, total_output, locktime, version, is_coinbase, confirmations, time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (txid) DO UPDATE SET
         blockhash = EXCLUDED.blockhash,
         blockheight = EXCLUDED.blockheight,
         blocktime = EXCLUDED.blocktime,
         confirmations = EXCLUDED.confirmations`,
      [
        tx.txid,
        block.hash,
        block.height,
        block.time,
        tx.size,
        tx.vsize ?? tx.size,
        tx.weight ?? tx.size * 4,
        fee < BigInt(0) ? BigInt(0) : fee.toString(),
        totalInput.toString(),
        totalOutput.toString(),
        tx.locktime,
        tx.version,
        isCoinbase,
        block.confirmations,
        block.time,
      ],
    );

    // Insert inputs
    for (let i = 0; i < tx.vin.length; i++) {
      const vin = tx.vin[i];
      await client.query(
        `INSERT INTO tx_inputs
          (txid, index_n, prev_txid, prev_vout, script_sig, sequence, witness, coinbase)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (txid, index_n) DO NOTHING`,
        [
          tx.txid,
          i,
          vin.txid ?? null,
          vin.vout ?? null,
          vin.scriptSig?.hex ?? '',
          vin.sequence,
          vin.txinwitness ?? [],
          vin.coinbase ?? null,
        ],
      );

      // Mark the referenced output as spent
      if (vin.txid) {
        await client.query(
          `UPDATE tx_outputs SET spent = true, spent_txid = $1
           WHERE txid = $2 AND index_n = $3`,
          [tx.txid, vin.txid, vin.vout],
        );
      }
    }

    // Insert outputs
    const addressUpdates: Map<string, { received: bigint; sent: bigint }> =
      new Map();

    for (let i = 0; i < tx.vout.length; i++) {
      const vout = tx.vout[i];
      const address = extractAddress(vout);
      const value = btcToSat(vout.value);

      await client.query(
        `INSERT INTO tx_outputs (txid, index_n, value, script_pubkey, address)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (txid, index_n) DO NOTHING`,
        [tx.txid, i, value.toString(), vout.scriptPubKey.hex ?? '', address],
      );

      if (address) {
        const entry = addressUpdates.get(address) ?? {
          received: BigInt(0),
          sent: BigInt(0),
        };
        entry.received += value;
        addressUpdates.set(address, entry);
      }
    }

    // Update address balances for outputs
    for (const [address, { received }] of addressUpdates) {
      await client.query(
        `INSERT INTO addresses (address, balance, total_received, tx_count)
         VALUES ($1, $2, $2, 1)
         ON CONFLICT (address) DO UPDATE SET
           balance = addresses.balance + EXCLUDED.balance,
           total_received = addresses.total_received + EXCLUDED.total_received,
           tx_count = addresses.tx_count + 1,
           updated_at = now()`,
        [address, received.toString()],
      );
    }

    // Deduct spent inputs from address balances
    if (!isCoinbase) {
      for (const vin of tx.vin) {
        if (vin.txid) {
          const res = await client.query<{ address: string; value: string }>(
            'SELECT address, value FROM tx_outputs WHERE txid = $1 AND index_n = $2',
            [vin.txid, vin.vout],
          );
          const row = res.rows[0];
          if (row?.address) {
            await client.query(
              `UPDATE addresses SET
                 balance = balance - $1,
                 total_sent = total_sent + $1,
                 updated_at = now()
               WHERE address = $2`,
              [row.value, row.address],
            );
          }
        }
      }
    }

    return fee < BigInt(0) ? BigInt(0) : fee;
  }

  // ── Main loop ─────────────────────────────────────────────────────────────

  async start(): Promise<void> {
    this.running = true;
    logger.info('Block indexer started');

    while (this.running) {
      try {
        await this.tick();
      } catch (err: unknown) {
        logger.error('Indexer tick error', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
      await new Promise((r) => setTimeout(r, config.indexer.pollInterval));
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    logger.info('Block indexer stopped');
  }

  private async tick(): Promise<void> {
    const info = await explorer.getInfo();
    const nodeHeight = info.height;
    const lastHeight = await this.getLastIndexedHeight();

    if (lastHeight >= nodeHeight) {
      logger.debug(`Up to date at height ${nodeHeight}`);
      return;
    }

    const batchEnd = Math.min(nodeHeight, lastHeight + config.indexer.batchSize);

    // ── 1. Populate hash cache from Redis ──
    const missingHeights: number[] = [];
    for (let h = lastHeight + 1; h <= batchEnd; h++) {
      if (!this.hashCache.has(h)) {
        const cached = await redis.get(`btcc:hash:h:${h}`);
        if (cached) {
          this.hashCache.set(h, cached);
        } else {
          missingHeights.push(h);
        }
      }
    }

    // ── 2. Walk backward only for missing heights ──
    if (missingHeights.length > 0) {
      const lowestMissing = missingHeights[0];

      // Find the nearest cached hash ABOVE lowestMissing to avoid re-walking
      // already-cached portions of the chain.
      let walkStartHash = info.bestBlockHash;
      let walkStartHeight = nodeHeight;

      for (let h = lowestMissing + 1; h <= nodeHeight; h++) {
        const inMem = this.hashCache.get(h);
        if (inMem) { walkStartHash = inMem; walkStartHeight = h; break; }
        const inRedis = await redis.get(`btcc:hash:h:${h}`);
        if (inRedis) { walkStartHash = inRedis; walkStartHeight = h; break; }
      }

      await this.buildHashCache(walkStartHash, walkStartHeight, lowestMissing);
    }

    // ── 3. Index in forward order ──
    logger.info(`Syncing blocks ${lastHeight + 1} → ${batchEnd}`);
    for (let h = lastHeight + 1; h <= batchEnd; h++) {
      const hash = this.hashCache.get(h);
      if (!hash) {
        logger.warn(`Hash not found for height ${h} — stopping batch`);
        break;
      }
      await this.indexBlockByHash(h, hash);
      this.hashCache.delete(h);
    }
  }

  /**
   * Walk backward from startHash until we have cached the hash for every
   * height down to stopAtHeight (inclusive). Persists to Redis so subsequent
   * restarts don't need to re-walk.
   */
  private async buildHashCache(
    startHash: string,
    startHeight: number,
    stopAtHeight: number,
  ): Promise<void> {
    logger.info(
      `Building hash cache: walking from height ${startHeight} → ${stopAtHeight}…`,
    );
    let currentHash = startHash;
    let count = 0;

    while (currentHash) {
      const block = await explorer.getBlock(currentHash);

      this.hashCache.set(block.height, block.hash);
      // Persist with 1-year TTL (immutable blockchain data)
      await redis.set(`btcc:hash:h:${block.height}`, block.hash, 'EX', 86400 * 365);

      count++;
      if (count % 500 === 0) {
        logger.info(
          `Hash cache progress: ${count} blocks walked, current height ${block.height}`,
        );
      }

      if (
        block.height <= stopAtHeight ||
        !block.previousblockhash ||
        block.height === 0
      ) {
        break;
      }

      currentHash = block.previousblockhash;

      // Small courtesy delay every 50 requests
      if (count % 50 === 0) await new Promise((r) => setTimeout(r, 100));
    }

    logger.info(`Hash cache built: walked ${count} blocks`);
  }
}

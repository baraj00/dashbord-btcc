import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import { logger } from '../logger';
import type { RpcBlock, RpcTransaction } from '../../shared/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExplorerInfo {
  height: number;
  bestBlockHash: string;
  chain: string;
  difficulty: number;
}

// ─── Client ───────────────────────────────────────────────────────────────────

/**
 * HTTP client for the BTCC public explorer REST API.
 *
 * Confirmed working endpoints:
 *   GET /api/info              → { height, bestBlockHash, chain, difficulty }
 *   GET /api/block/:hash       → full block with embedded transactions (verbosity=2)
 *   GET /api/tx/:txid          → full transaction
 */
export class ExplorerClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.explorer.url,
      timeout: config.explorer.timeout,
      headers: { Accept: 'application/json' },
    });

    axiosRetry(this.http, {
      retries: config.explorer.maxRetries,
      retryDelay: (count) => Math.min(2000 * 2 ** count, 60_000),
      retryCondition: (err) => !err.response || err.response.status >= 500,
      onRetry: (count, err) => {
        logger.warn(`Explorer retry ${count}`, { error: err.message });
      },
    });
  }

  /** Network tip: height, bestBlockHash, difficulty */
  async getInfo(): Promise<ExplorerInfo> {
    const res = await this.http.get<ExplorerInfo>('/api/info');
    return res.data;
  }

  /**
   * Full block with all transactions embedded.
   * Equivalent to bitcoind RPC getblock(hash, verbosity=2).
   */
  async getBlock(hash: string): Promise<RpcBlock> {
    const res = await this.http.get<RpcBlock>(`/api/block/${hash}`);
    return res.data;
  }

  /** Full transaction detail */
  async getTransaction(txid: string): Promise<RpcTransaction> {
    const res = await this.http.get<RpcTransaction>(`/api/tx/${txid}`);
    return res.data;
  }

  async ping(): Promise<boolean> {
    try {
      await this.getInfo();
      return true;
    } catch {
      return false;
    }
  }
}

export const explorer = new ExplorerClient();

import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import { logger } from '../logger';
import type {
  RpcBlock,
  RpcTransaction,
  RpcBlockchainInfo,
  RpcNetworkInfo,
  RpcMiningInfo,
  RpcMempoolInfo,
} from '../../../shared/types';

let _reqId = 0;

export class RpcClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.rpc.url,
      timeout: config.rpc.timeout,
      auth: {
        username: config.rpc.user,
        password: config.rpc.password,
      },
      headers: { 'Content-Type': 'application/json' },
    });

    axiosRetry(this.client, {
      retries: config.rpc.maxRetries,
      retryDelay: (count) => Math.min(1000 * 2 ** count, 30_000),
      retryCondition: (err) => {
        // Retry network errors and 5xx, but not auth errors
        if (!err.response) return true;
        return err.response.status >= 500;
      },
      onRetry: (count, err) => {
        logger.warn(`RPC retry ${count}`, { error: err.message });
      },
    });
  }

  private async call<T>(method: string, params: unknown[] = []): Promise<T> {
    const id = ++_reqId;
    try {
      const res = await this.client.post('/', {
        jsonrpc: '1.1',
        id,
        method,
        params,
      });

      if (res.data.error) {
        throw new Error(`RPC error ${res.data.error.code}: ${res.data.error.message}`);
      }

      return res.data.result as T;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        logger.error(`RPC call failed: ${method}`, {
          status: err.response?.status,
          data: err.response?.data,
        });
      }
      throw err;
    }
  }

  // ── Blockchain ────────────────────────────────────────────────────────────

  async getBlockchainInfo(): Promise<RpcBlockchainInfo> {
    return this.call('getblockchaininfo');
  }

  async getBlockCount(): Promise<number> {
    return this.call('getblockcount');
  }

  async getBestBlockHash(): Promise<string> {
    return this.call('getbestblockhash');
  }

  async getBlockHash(height: number): Promise<string> {
    return this.call('getblockhash', [height]);
  }

  /** verbosity=2 returns full tx objects */
  async getBlock(hash: string, verbosity = 2): Promise<RpcBlock> {
    return this.call('getblock', [hash, verbosity]);
  }

  async getBlockByHeight(height: number, verbosity = 2): Promise<RpcBlock> {
    const hash = await this.getBlockHash(height);
    return this.getBlock(hash, verbosity);
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  async getRawTransaction(txid: string, verbose = true): Promise<RpcTransaction> {
    return this.call('getrawtransaction', [txid, verbose ? 1 : 0]);
  }

  // ── Network ───────────────────────────────────────────────────────────────

  async getNetworkInfo(): Promise<RpcNetworkInfo> {
    return this.call('getnetworkinfo');
  }

  async getMiningInfo(): Promise<RpcMiningInfo> {
    return this.call('getmininginfo');
  }

  // ── Mempool ───────────────────────────────────────────────────────────────

  async getMempoolInfo(): Promise<RpcMempoolInfo> {
    return this.call('getmempoolinfo');
  }

  async getRawMempool(verbose = false): Promise<string[] | Record<string, unknown>> {
    return this.call('getrawmempool', [verbose]);
  }

  async getMempoolEntry(txid: string): Promise<Record<string, unknown>> {
    return this.call('getmempoolentry', [txid]);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      await this.call('ping');
      return true;
    } catch {
      return false;
    }
  }

  async getNetworkHashrate(nblocks = 120): Promise<number> {
    try {
      return await this.call<number>('getnetworkhashps', [nblocks]);
    } catch {
      return 0;
    }
  }
}

export const rpc = new RpcClient();

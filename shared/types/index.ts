// ─────────────────────────────────────────────────────────────────────────────
//  BTCC Explorer — Shared Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Block {
  hash: string;
  height: number;
  version: number;
  previousblockhash: string;
  merkleroot: string;
  time: number;
  bits: string;
  nonce: number;
  difficulty: number;
  size: number;
  weight: number;
  tx_count: number;
  total_fees: string; // in satoshis as string to avoid precision loss
  reward: string;     // block reward in satoshis as string
  confirmations: number;
  created_at: string;
}

export interface Transaction {
  txid: string;
  blockhash: string | null;
  blockheight: number | null;
  blocktime: number | null;
  size: number;
  vsize: number;
  weight: number;
  fee: string; // satoshis
  total_input: string;
  total_output: string;
  locktime: number;
  version: number;
  is_coinbase: boolean;
  confirmations: number;
  time: number;
  created_at: string;
  vin: TxInput[];
  vout: TxOutput[];
}

export interface TxInput {
  id: number;
  txid: string;
  index: number;
  prev_txid: string | null;
  prev_vout: number | null;
  script_sig: string;
  sequence: number;
  witness: string[];
  value: string | null; // satoshis
  address: string | null;
  coinbase: string | null;
}

export interface TxOutput {
  id: number;
  txid: string;
  index: number;
  value: string; // satoshis
  script_pubkey: string;
  address: string | null;
  spent: boolean;
  spent_txid: string | null;
}

export interface Address {
  address: string;
  balance: string;         // satoshis
  total_received: string;  // satoshis
  total_sent: string;      // satoshis
  tx_count: number;
  unconfirmed_balance: string;
}

export interface AddressTx {
  txid: string;
  blockhash: string | null;
  blockheight: number | null;
  blocktime: number | null;
  value: string; // net value change for this address
  time: number;
}

export interface MempoolEntry {
  txid: string;
  size: number;
  vsize: number;
  weight: number;
  fee: string;
  fee_rate: string; // sat/vbyte
  time: number;
  depends: string[];
}

export interface NetworkStats {
  blockcount: number;
  bestblockhash: string;
  difficulty: number;
  hashrate: string;
  connections: number;
  mempool_size: number;
  mempool_bytes: number;
  total_supply: string;
  block_reward: string;
  next_halving_block: number;
  blocks_until_halving: number;
  avg_block_time: number; // seconds
  avg_fee_rate: string;   // sat/vbyte
}

export interface RichlistEntry {
  rank: number;
  address: string;
  balance: string;
  percent: number;
  tx_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  code: number;
  message: string;
}

// ─── RPC Raw Types ───────────────────────────────────────────────────────────

export interface RpcBlock {
  hash: string;
  confirmations: number;
  size: number;
  weight: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: RpcTransaction[] | string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  nTx: number;
  previousblockhash: string;
  nextblockhash?: string;
  strippedsize: number;
}

export interface RpcTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: RpcVin[];
  vout: RpcVout[];
  blockhash?: string;
  confirmations?: number;
  blocktime?: number;
  time?: number;
}

export interface RpcVin {
  txid?: string;
  vout?: number;
  scriptSig?: { asm: string; hex: string };
  txinwitness?: string[];
  sequence: number;
  coinbase?: string;
}

export interface RpcVout {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
    address?: string;
    addresses?: string[];
  };
}

export interface RpcNetworkInfo {
  version: number;
  subversion: string;
  protocolversion: number;
  connections: number;
  networkactive: boolean;
}

export interface RpcBlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  chainwork: string;
  pruned: boolean;
}

export interface RpcMiningInfo {
  blocks: number;
  currentblockweight: number;
  currentblocktx: number;
  difficulty: number;
  networkhashps: number;
  pooledtx: number;
  chain: string;
}

export interface RpcMempoolInfo {
  loaded: boolean;
  size: number;
  bytes: number;
  usage: number;
  maxmempool: number;
  mempoolminfee: number;
  minrelaytxfee: number;
}

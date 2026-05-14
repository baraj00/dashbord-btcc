// SSR: call backend directly via Docker internal hostname (read at runtime, not baked)
// Browser: use relative path so Next.js rewrites proxy to backend
const API_BASE =
  typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || 'https://btcc-backend.fly.dev')
    : '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...init,
    next: { revalidate: 10 },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
};

// ── Typed endpoint helpers ────────────────────────────────────────────────────

export function fetcher<T>(url: string): Promise<T> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });
}

export const endpoints = {
  stats: '/api/stats',
  blocks: (page = 1, limit = 25) => `/api/blocks?page=${page}&limit=${limit}`,
  block: (hash: string) => `/api/block/${hash}`,
  tx: (hash: string) => `/api/tx/${hash}`,
  address: (addr: string) => `/api/address/${addr}`,
  addressTxs: (addr: string, page = 1) => `/api/address/${addr}/txs?page=${page}`,
  addressUtxos: (addr: string) => `/api/address/${addr}/utxos`,
  mempool: (page = 1, sort = 'fee_rate') =>
    `/api/mempool?page=${page}&sort=${sort}`,
  richlist: (page = 1) => `/api/richlist?page=${page}`,
};

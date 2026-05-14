// ─────────────────────────────────────────────────────────────────────────────
//  Formatting utilities for BTCC Explorer UI
// ─────────────────────────────────────────────────────────────────────────────

const SATOSHIS = 100_000_000;

export function satsToBtcc(sats: string | number | bigint): string {
  const n = typeof sats === 'bigint' ? Number(sats) : Number(sats);
  return (n / SATOSHIS).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

export function formatBtcc(sats: string | number): string {
  return `${satsToBtcc(sats)} BTCC`;
}

export function shortHash(hash: string, start = 8, end = 8): string {
  if (!hash || hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

export function formatNumber(n: number | string): string {
  return Number(n).toLocaleString('en-US');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatHashrate(hps: string | number): string {
  const h = Number(hps);
  if (h >= 1e18) return `${(h / 1e18).toFixed(2)} EH/s`;
  if (h >= 1e15) return `${(h / 1e15).toFixed(2)} PH/s`;
  if (h >= 1e12) return `${(h / 1e12).toFixed(2)} TH/s`;
  if (h >= 1e9) return `${(h / 1e9).toFixed(2)} GH/s`;
  if (h >= 1e6) return `${(h / 1e6).toFixed(2)} MH/s`;
  return `${h.toFixed(2)} H/s`;
}

export function formatDifficulty(diff: number): string {
  if (diff >= 1e12) return `${(diff / 1e12).toFixed(2)} T`;
  if (diff >= 1e9) return `${(diff / 1e9).toFixed(2)} G`;
  if (diff >= 1e6) return `${(diff / 1e6).toFixed(2)} M`;
  return diff.toFixed(2);
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function feeRateColor(feeRate: number): string {
  if (feeRate < 2) return 'text-neon-green';
  if (feeRate < 10) return 'text-btcc-400';
  if (feeRate < 50) return 'text-neon-orange';
  return 'text-neon-red';
}

export function percent(value: number): string {
  return `${value.toFixed(4)}%`;
}

'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { endpoints } from '@/lib/api';
import {
  formatNumber,
  formatHashrate,
  formatDifficulty,
  formatBtcc,
  timeAgo,
} from '@/lib/format';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useLang } from '@/lib/i18n';
import type { NetworkStats } from '@shared/types';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ? 'text-btcc-400' : ''}`}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export function StatsGrid() {
  const { data, isLoading } = useSWR<NetworkStats>(endpoints.stats, {
    refreshInterval: 15000,
  });
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label={t.stats.blockHeight}
        value={formatNumber(data.blockcount)}
        accent
      />
      <StatCard
        label={t.stats.hashrate}
        value={formatHashrate(data.hashrate)}
        sub={t.stats.networkHashrate}
      />
      <StatCard
        label={t.stats.difficulty}
        value={formatDifficulty(data.difficulty)}
      />
      <StatCard
        label={t.stats.blockReward}
        value={formatBtcc(data.block_reward)}
        sub={t.stats.nextHalving(formatNumber(data.blocks_until_halving))}
      />
      <StatCard
        label={t.stats.mempoolTxs}
        value={formatNumber(data.mempool_size)}
        sub={`${formatNumber(data.mempool_bytes)} vbytes`}
      />
      <StatCard
        label={t.stats.avgBlockTime}
        value={`${data.avg_block_time}s`}
        sub="Target: 600s"
      />
      <StatCard
        label={t.stats.totalSupply}
        value={formatBtcc(data.total_supply)}
        sub={t.stats.circulating}
      />
      <StatCard
        label="Connections"
        value={formatNumber(data.connections)}
        sub="Active peers"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ? 'text-btcc-400' : ''}`}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export function StatsGrid() {
  const { data, isLoading } = useSWR<NetworkStats>(endpoints.stats, {
    refreshInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Block Height"
        value={formatNumber(data.blockcount)}
        accent
      />
      <StatCard
        label="Hashrate"
        value={formatHashrate(data.hashrate)}
        sub="Network hashrate"
      />
      <StatCard
        label="Difficulty"
        value={formatDifficulty(data.difficulty)}
      />
      <StatCard
        label="Block Reward"
        value={formatBtcc(data.block_reward)}
        sub={`Next halving in ${formatNumber(data.blocks_until_halving)} blocks`}
      />
      <StatCard
        label="Mempool TXs"
        value={formatNumber(data.mempool_size)}
        sub={`${formatNumber(data.mempool_bytes)} vbytes`}
      />
      <StatCard
        label="Avg Block Time"
        value={`${data.avg_block_time}s`}
        sub="Target: 600s"
      />
      <StatCard
        label="Next Halving"
        value={`Block ${formatNumber(data.next_halving_block)}`}
        sub={`${formatNumber(data.blocks_until_halving)} blocks away`}
      />
      <StatCard
        label="Connections"
        value={formatNumber(data.connections)}
        sub="Active peers"
      />
    </div>
  );
}

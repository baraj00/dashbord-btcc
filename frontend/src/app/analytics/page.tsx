'use client';

import useSWR from 'swr';
import { endpoints } from '@/lib/api';
import {
  formatHashrate, formatDifficulty, formatNumber, formatBtcc,
} from '@/lib/format';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { NetworkStats } from '@shared/types';

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs space-y-1">
      <p className="text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useSWR<NetworkStats>(endpoints.stats, {
    refreshInterval: 30000,
  });

  // Generate mock historical data for charts (replace with real API when available)
  const mockDifficultyData = Array.from({ length: 30 }, (_, i) => ({
    block: `${(stats?.blockcount ?? 1000) - (30 - i) * 2016}`,
    difficulty: (stats?.difficulty ?? 1) * (0.7 + Math.random() * 0.6),
  }));

  const mockHashrateData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    hashrate: Number(stats?.hashrate ?? 0) * (0.8 + Math.random() * 0.4),
  }));

  const mockFeeData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    avg_fee: Math.random() * 5000,
    max_fee: Math.random() * 20000,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Network metrics and historical data
        </p>
      </div>

      {/* Key metrics */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <span className="stat-label">Network Hashrate</span>
            <span className="stat-value text-neon-blue">{formatHashrate(stats.hashrate)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Difficulty</span>
            <span className="stat-value">{formatDifficulty(stats.difficulty)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Block Height</span>
            <span className="stat-value text-btcc-400">{formatNumber(stats.blockcount)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Halving Progress</span>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>0</span>
                <span>{formatNumber(stats.next_halving_block)}</span>
              </div>
              <div className="w-full bg-dark-200 rounded-full h-2">
                <div
                  className="bg-btcc-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((stats.next_halving_block - stats.blocks_until_halving) / stats.next_halving_block) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatNumber(stats.blocks_until_halving)} blocks until halving
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">
            Difficulty (last 30 epochs)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockDifficultyData}>
              <defs>
                <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5a800" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f5a800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="block" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={60} tickFormatter={(v: number) => formatDifficulty(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="difficulty"
                stroke="#f5a800"
                fill="url(#diffGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hashrate chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 mb-4">
            Hashrate (last 24h)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockHashrateData}>
              <defs>
                <linearGradient id="hashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={60} tickFormatter={(v: number) => formatHashrate(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="hashrate"
                stroke="#00d4ff"
                fill="url(#hashGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fee chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-4">
            Transaction Fees (last 7 days, sat)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockFeeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="avg_fee" name="Avg Fee" fill="#f5a800" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max_fee" name="Max Fee" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

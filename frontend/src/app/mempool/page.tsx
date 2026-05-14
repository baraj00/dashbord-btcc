'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { endpoints } from '@/lib/api';
import { shortHash, formatBtcc, timeAgo, formatNumber } from '@/lib/format';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { PaginatedResponse, MempoolEntry } from '@shared/types';

type SortKey = 'fee_rate' | 'fee' | 'size' | 'time';

export default function MempoolPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('fee_rate');

  const { data, isLoading } = useSWR<
    PaginatedResponse<MempoolEntry> & { total_vsize: number }
  >(endpoints.mempool(page, sort), { refreshInterval: 8000 });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'fee_rate', label: 'Fee Rate' },
    { key: 'fee', label: 'Fee' },
    { key: 'size', label: 'Size' },
    { key: 'time', label: 'Time' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mempool</h1>
          {data && (
            <p className="text-slate-500 text-sm mt-1">
              {formatNumber(data.total)} pending transactions ·{' '}
              {formatNumber(data.total_vsize)} total vbytes
            </p>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setSort(opt.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sort === opt.key
                  ? 'bg-btcc-500/20 text-btcc-400 border border-btcc-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-dark-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-200 bg-dark-400">
                <th className="px-4 py-3 text-left">TxID</th>
                <th className="px-4 py-3 text-right">vsize</th>
                <th className="px-4 py-3 text-right">Weight</th>
                <th className="px-4 py-3 text-right">Fee Rate</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 25 }).map((_, i) => (
                    <SkeletonRow key={i} cols={6} />
                  ))
                : data?.data.map((tx) => {
                    const rate = Number(tx.fee_rate);
                    return (
                      <tr key={tx.txid} className="table-row">
                        <td className="px-4 py-3">
                          <Link href={`/tx/${tx.txid}`} className="hash text-xs">
                            {shortHash(tx.txid)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono">
                          {tx.vsize}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 font-mono">
                          {tx.weight}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span
                            className={
                              rate > 50
                                ? 'text-red-400'
                                : rate > 10
                                ? 'text-neon-orange'
                                : 'text-neon-green'
                            }
                          >
                            {rate.toFixed(2)} sat/vB
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 font-mono">
                          {formatBtcc(tx.fee)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {timeAgo(tx.time)}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200">
            <span className="text-xs text-slate-500">
              Page {page} of {Math.ceil(data.total / 25)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed py-1.5"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.has_more}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed py-1.5"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

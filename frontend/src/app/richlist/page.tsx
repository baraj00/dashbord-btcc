'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { endpoints } from '@/lib/api';
import { shortHash, formatBtcc, formatNumber, percent } from '@/lib/format';
import { SkeletonRow } from '@/components/ui/Skeleton';
import type { PaginatedResponse, RichlistEntry } from '@shared/types';

export default function RichlistPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR<PaginatedResponse<RichlistEntry>>(
    endpoints.richlist(page),
    { refreshInterval: 60000 },
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Rich List</h1>
        <p className="text-slate-500 text-sm mt-1">
          Top addresses by BTCC balance
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-200 bg-dark-400">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">% Supply</th>
                <th className="px-4 py-3 text-right">Txs</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 50 }).map((_, i) => (
                    <SkeletonRow key={i} cols={5} />
                  ))
                : data?.data.map((entry) => (
                    <tr key={entry.address} className="table-row">
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono font-bold ${
                            entry.rank === 1
                              ? 'text-btcc-400'
                              : entry.rank <= 3
                              ? 'text-slate-300'
                              : 'text-slate-500'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/address/${entry.address}`}
                          className="hash text-xs"
                        >
                          {shortHash(entry.address, 16, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-btcc-400">
                        {formatBtcc(entry.balance)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono">
                        {percent(entry.percent)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatNumber(entry.tx_count)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200">
            <span className="text-xs text-slate-500">
              Page {page} of {Math.ceil(data.total / 50)}
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

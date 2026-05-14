'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import { endpoints } from '@/lib/api';
import { timeAgo, shortHash, formatNumber, formatBtcc } from '@/lib/format';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import type { PaginatedResponse, Block } from '@shared/types';

export default function BlocksPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR<PaginatedResponse<Block>>(
    endpoints.blocks(page, 25),
    { refreshInterval: 15000 },
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Blocks</h1>
        {data && (
          <p className="text-slate-500 text-sm mt-1">
            {formatNumber(data.total)} blocks indexed
          </p>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-200 bg-dark-400">
                <th className="px-4 py-3 text-left">Height</th>
                <th className="px-4 py-3 text-left">Hash</th>
                <th className="px-4 py-3 text-right">Txs</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Difficulty</th>
                <th className="px-4 py-3 text-right">Reward</th>
                <th className="px-4 py-3 text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 25 }).map((_, i) => (
                    <SkeletonRow key={i} cols={7} />
                  ))
                : data?.data.map((block) => (
                    <tr key={block.hash} className="table-row">
                      <td className="px-4 py-3">
                        <Link
                          href={`/blocks/${block.height}`}
                          className="text-btcc-400 hover:text-btcc-300 font-mono font-semibold"
                        >
                          {formatNumber(block.height)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/blocks/${block.hash}`} className="hash text-xs">
                          {shortHash(block.hash)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        {block.tx_count}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">
                        {(block.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">
                        {formatNumber(Math.round(block.difficulty))}
                      </td>
                      <td className="px-4 py-3 text-right text-btcc-400 font-mono">
                        {formatBtcc(block.reward)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {timeAgo(block.time)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

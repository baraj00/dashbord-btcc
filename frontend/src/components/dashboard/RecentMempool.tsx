'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { endpoints } from '@/lib/api';
import { shortHash, formatBtcc, timeAgo } from '@/lib/format';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { PaginatedResponse, MempoolEntry } from '@shared/types';

export function RecentMempool() {
  const { data, isLoading } = useSWR<
    PaginatedResponse<MempoolEntry> & { total_vsize: number }
  >(endpoints.mempool(1, 'fee_rate'), {
    refreshInterval: 8000,
  });

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-200">Mempool</h2>
          {data && (
            <Badge variant="orange">{data.total} pending</Badge>
          )}
        </div>
        <Link href="/mempool" className="text-xs text-btcc-400 hover:text-btcc-300">
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-dark-200">
              <th className="px-4 py-2 text-left">TxID</th>
              <th className="px-4 py-2 text-right">vsize</th>
              <th className="px-4 py-2 text-right">Fee rate</th>
              <th className="px-4 py-2 text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={4} />
                ))
              : data?.data.slice(0, 8).map((tx) => (
                  <tr key={tx.txid} className="table-row">
                    <td className="px-4 py-3">
                      <Link href={`/tx/${tx.txid}`} className="hash text-xs">
                        {shortHash(tx.txid)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono">
                      {tx.vsize}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span
                        className={
                          Number(tx.fee_rate) > 10
                            ? 'text-neon-orange'
                            : 'text-neon-green'
                        }
                      >
                        {Number(tx.fee_rate).toFixed(1)} sat/vB
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono">
                      {formatBtcc(tx.fee)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

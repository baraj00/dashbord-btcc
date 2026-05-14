'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { endpoints } from '@/lib/api';
import { timeAgo, formatNumber, formatBtcc, shortHash } from '@/lib/format';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useLang } from '@/lib/i18n';
import type { PaginatedResponse, Block } from '@shared/types';

export function RecentBlocks() {
  const { data, isLoading } = useSWR<PaginatedResponse<Block>>(
    endpoints.blocks(1, 10),
    { refreshInterval: 10000 },
  );
  const { t } = useLang();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200">
        <h2 className="font-semibold text-slate-200">{t.sections.latestBlocks}</h2>
        <Link href="/blocks" className="text-xs text-btcc-400 hover:text-btcc-300">
          {t.sections.viewAll}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-dark-200">
              <th className="px-4 py-2 text-left">{t.table.height}</th>
              <th className="px-4 py-2 text-left">{t.table.hash}</th>
              <th className="px-4 py-2 text-right">{t.table.txs}</th>
              <th className="px-4 py-2 text-right">{t.table.size}</th>
              <th className="px-4 py-2 text-right">{t.table.age}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              : data?.data.map((block) => (
                  <tr key={block.hash} className="table-row">
                    <td className="px-4 py-3">
                      <Link
                        href={`/blocks/${block.height}`}
                        className="text-btcc-400 hover:text-btcc-300 font-mono font-medium"
                      >
                        {block.height}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/blocks/${block.hash}`}
                        className="hash text-xs"
                        title={block.hash}
                      >
                        {shortHash(block.hash)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {block.tx_count}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {(block.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {timeAgo(block.time)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

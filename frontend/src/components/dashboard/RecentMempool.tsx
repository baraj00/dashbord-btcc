'use client';

import { useLang } from '@/lib/i18n';

export function RecentMempool() {
  const { t } = useLang();
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200">
        <h2 className="font-semibold text-slate-200">{t.mempool.title}</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <span className="text-3xl">🔧</span>
        <p className="text-sm font-medium text-slate-400">{t.mempool.comingSoon}</p>
        <p className="text-xs text-center max-w-xs">{t.mempool.description}</p>
      </div>
    </div>
  );
}

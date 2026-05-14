'use client';

import { useLang } from '@/lib/i18n';

export function HomeHero() {
  const { t } = useLang();
  return (
    <div className="text-center py-8">
      <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-3 tracking-tight">
        <span className="text-btcc-400">₿TCC</span> Explorer
      </h1>
      <p className="text-slate-400 text-lg">{t.hero.subtitle}</p>
    </div>
  );
}

export function NetworkOverviewLabel() {
  const { t } = useLang();
  return (
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
      {t.sections.networkOverview}
    </h2>
  );
}

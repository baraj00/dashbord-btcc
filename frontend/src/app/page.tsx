import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentBlocks } from '@/components/dashboard/RecentBlocks';
import { RecentMempool } from '@/components/dashboard/RecentMempool';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BTCC Explorer — Bitcoin Classic Blockchain',
};

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-3 tracking-tight">
          <span className="text-btcc-400">₿TCC</span> Explorer
        </h1>
        <p className="text-slate-400 text-lg">
          Bitcoin Classic Blockchain — Real-time Explorer &amp; Analytics
        </p>
      </div>

      {/* Network stats */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Network Overview
        </h2>
        <StatsGrid />
      </section>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBlocks />
        <RecentMempool />
      </div>
    </div>
  );
}

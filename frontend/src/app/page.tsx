import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentBlocks } from '@/components/dashboard/RecentBlocks';
import { RecentMempool } from '@/components/dashboard/RecentMempool';
import { HomeHero } from '@/components/dashboard/HomeHero';
import { NetworkOverviewLabel } from '@/components/dashboard/HomeHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BTCC Explorer — Bitcoin Classic Blockchain',
};

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <HomeHero />

      <section>
        <NetworkOverviewLabel />
        <StatsGrid />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBlocks />
        <RecentMempool />
      </div>
    </div>
  );
}

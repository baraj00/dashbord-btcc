'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'zh';

export const translations = {
  en: {
    // Nav
    nav: {
      dashboard: 'Dashboard',
      blocks: 'Blocks',
      mining: 'Mining',
      richlist: 'Richlist',
      analytics: 'Analytics',
      live: 'Live',
    },
    // Home hero
    hero: {
      subtitle: 'Bitcoin Classic Blockchain — Real-time Explorer & Analytics',
    },
    // Sections
    sections: {
      networkOverview: 'Network Overview',
      latestBlocks: 'Latest Blocks',
      viewAll: 'View all →',
    },
    // Stats
    stats: {
      blockHeight: 'Block Height',
      hashrate: 'Hashrate',
      networkHashrate: 'Network hashrate',
      difficulty: 'Difficulty',
      blockReward: 'Block Reward',
      nextHalving: (n: string) => `Next halving in ${n} blocks`,
      mempoolTxs: 'Mempool TXs',
      avgBlockTime: 'Avg Block Time',
      totalSupply: 'Total Supply',
      circulating: 'Circulating',
    },
    // Table headers
    table: {
      height: 'Height',
      hash: 'Hash',
      txs: 'Txs',
      size: 'Size',
      age: 'Age',
    },
    // Mempool
    mempool: {
      title: 'Mempool',
      comingSoon: 'Coming soon',
      description: 'Real-time mempool requires a full BTCC node. Coming soon.',
    },
    // Search
    search: {
      placeholder: 'Search by block, txid, address…',
    },
  },
  zh: {
    nav: {
      dashboard: '首页',
      blocks: '区块',
      mining: '挖矿',
      richlist: '富豪榜',
      analytics: '分析',
      live: '实时',
    },
    hero: {
      subtitle: '比特币经典区块链 — 实时浏览器与数据分析',
    },
    sections: {
      networkOverview: '网络概览',
      latestBlocks: '最新区块',
      viewAll: '查看全部 →',
    },
    stats: {
      blockHeight: '区块高度',
      hashrate: '算力',
      networkHashrate: '网络算力',
      difficulty: '难度',
      blockReward: '区块奖励',
      nextHalving: (n: string) => `${n} 个区块后减半`,
      mempoolTxs: '内存池交易',
      avgBlockTime: '平均出块时间',
      totalSupply: '总供应量',
      circulating: '流通中',
    },
    table: {
      height: '高度',
      hash: '哈希',
      txs: '交易',
      size: '大小',
      age: '时间',
    },
    mempool: {
      title: 'Mempool',
      comingSoon: '即将上线',
      description: '实时内存池需要完整的 BTCC 节点，敬请期待。',
    },
    search: {
      placeholder: '搜索区块、交易ID、地址…',
    },
  },
} as const;

export type Translations = typeof translations.en;

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: translations.en,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggle = () => setLang((l) => (l === 'en' ? 'zh' : 'en'));

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

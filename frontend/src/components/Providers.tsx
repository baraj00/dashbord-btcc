'use client';

import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { fetcher } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 15000,
        revalidateOnFocus: false,
        dedupingInterval: 5000,
      }}
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d1f3c',
            color: '#e2e8f0',
            border: '1px solid #1e3a5f',
            fontFamily: 'Inter, system-ui',
          },
        }}
      />
    </SWRConfig>
  );
}

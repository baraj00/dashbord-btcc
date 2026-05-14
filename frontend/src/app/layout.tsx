import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    template: '%s | BTCC Explorer',
    default: 'BTCC Explorer — Bitcoin Classic Blockchain',
  },
  description:
    'The official Bitcoin Classic (BTCC) blockchain explorer. Browse blocks, transactions, addresses and real-time network statistics.',
  keywords: ['BTCC', 'Bitcoin Classic', 'blockchain', 'explorer', 'crypto'],
  openGraph: {
    title: 'BTCC Explorer',
    description: 'Bitcoin Classic Blockchain Explorer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

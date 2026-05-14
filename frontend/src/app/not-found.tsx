import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found | BTCC Explorer' };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fade-in">
      <div>
        <p className="text-8xl font-black text-btcc-500/20">404</p>
        <h1 className="text-2xl font-bold text-slate-200 -mt-4">Page Not Found</h1>
        <p className="text-slate-500 mt-2">
          The block, transaction, or address you're looking for doesn't exist.
        </p>
      </div>
      <Link href="/" className="btn-primary">
        ← Back to Explorer
      </Link>
    </div>
  );
}

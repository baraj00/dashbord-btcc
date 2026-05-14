'use client';

import { useState } from 'react';
import { shortHash } from '@/lib/format';
import toast from 'react-hot-toast';

interface Props {
  hash: string;
  className?: string;
  short?: boolean;
}

export function CopyButton({ hash, className = '', short = false }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 group ${className}`}
      title="Copy to clipboard"
    >
      <span className="hash text-sm">{short ? shortHash(hash) : hash}</span>
      <svg
        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
          copied ? 'text-neon-green' : 'text-slate-600 group-hover:text-btcc-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
    </button>
  );
}

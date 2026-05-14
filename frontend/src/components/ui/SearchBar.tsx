'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (/^\d+$/.test(q)) {
      // Block height
      router.push(`/blocks/${q}`);
    } else if (/^[0-9a-fA-F]{64}$/.test(q)) {
      // Could be block hash or tx hash — try tx first, fallback to block
      router.push(`/tx/${q}`);
    } else if (q.length >= 25 && q.length <= 100) {
      // Address
      router.push(`/address/${q}`);
    }

    setQuery('');
  }

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div
        className={`flex items-center gap-2 bg-dark-300 border rounded-lg px-3 py-2 transition-colors ${
          focused ? 'border-btcc-500/60' : 'border-dark-200'
        }`}
      >
        <svg
          className="w-4 h-4 text-slate-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by block, txid, address…"
          className="bg-transparent flex-1 text-sm text-slate-200 placeholder-slate-600 outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="hidden lg:inline-flex items-center gap-0.5 text-slate-600 text-xs font-mono">
          <span>⌃K</span>
        </kbd>
      </div>
    </form>
  );
}

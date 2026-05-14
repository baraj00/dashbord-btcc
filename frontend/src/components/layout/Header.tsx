'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { useLang } from '@/lib/i18n';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, toggle } = useLang();

  const navLinks = [
    { href: '/',          label: t.nav.dashboard },
    { href: '/blocks',    label: t.nav.blocks },
    { href: '/mining',    label: t.nav.mining },
    { href: '/richlist',  label: t.nav.richlist },
    { href: '/analytics', label: t.nav.analytics },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-dark-200 bg-dark-500/90 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-black text-btcc-400 tracking-tight">
              ₿TCC
            </span>
            <span className="hidden sm:block text-xs text-slate-500 font-medium mt-1">
              Explorer
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-btcc-500/10 text-btcc-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right side: Live + Lang toggle */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="live-dot" />
              <span>{t.nav.live}</span>
            </div>
            {/* Language toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-dark-200 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-btcc-500/50 transition-colors"
              title={lang === 'en' ? 'Switch to Chinese' : '切换到英文'}
            >
              {lang === 'en' ? (
                <>
                  <span>🇨🇳</span>
                  <span>中文</span>
                </>
              ) : (
                <>
                  <span>🇬🇧</span>
                  <span>EN</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-dark-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-btcc-500/10 text-btcc-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile lang toggle */}
            <button
              onClick={toggle}
              className="mt-1 mx-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              {lang === 'en' ? '🇨🇳 中文' : '🇬🇧 English'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

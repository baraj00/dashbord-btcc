import Link from 'next/link';

const links = [
  { href: 'https://github.com/Marcus-Vane/Bitcoin-Classic', label: 'GitHub' },
  { href: 'https://x.com/Btc_Classic_KOL', label: 'Twitter' },
  {
    href: 'https://github.com/Marcus-Vane/Bitcoin-Classic/releases/download/v1.0.0/Bitcoin-Classic-Setup.exe',
    label: 'Download Node',
  },
];

export function Footer() {
  return (
    <footer className="border-t border-dark-200 mt-12">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-btcc-400 font-black text-lg">₿TCC</span>
            <span className="text-slate-500 text-sm">
              Bitcoin Classic Explorer
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-btcc-400 text-sm transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Bitcoin Classic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

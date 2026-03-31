import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg">⚽</span>
          <span className="font-bold text-xs tracking-widest uppercase text-white/60 hidden sm:block">
            WC 2026
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-xs">
          <Link href="/bracket" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            Build Bracket
          </Link>
          <Link href="/my-brackets" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            My Brackets
          </Link>
        </nav>
      </div>
    </header>
  );
}

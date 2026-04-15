'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletButton } from '@/components/wallet/WalletButton';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { useUserDivision } from '@/lib/web3/hooks/useUserDivision';

export function Header() {
  const { division, isConnected } = useUserDivision();

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-wordmark.png"
            alt="Meebits Futbol"
            width={78}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-1 text-xs">
          <Link href="/bracket" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            Build Bracket
          </Link>
          <Link href="/leaderboard" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            Leaderboard
          </Link>
          <Link href="/divisions" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            Divisions
          </Link>
          <Link href="/my-brackets" className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
            My Bracket
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isConnected && division && (
            <DivisionBadge division={division} size="sm" showLabel={false} />
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

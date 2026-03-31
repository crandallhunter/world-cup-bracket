import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-52px)] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-10 max-w-xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-white/35 text-xs font-medium tracking-widest uppercase">
          <span className="w-1 h-1 bg-white/30 rounded-full" />
          2026 FIFA World Cup · 48 Countries · One country takes all the glory
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            BRACKET<br />CHALLENGE
          </h1>
          <p className="text-white/35 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">
            Predict. Play. Win.
          </p>
        </div>

        {/* Feature row */}
        <div className="flex items-center gap-6 text-xs text-white/25 uppercase tracking-widest font-medium">
          <span>Market Odds</span>
          <span className="w-px h-3 bg-white/10" />
          <span>Token-Gated</span>
          <span className="w-px h-3 bg-white/10" />
          <span>48 Teams</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <Link
            href="/bracket"
            className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-white hover:bg-white/85 text-black font-semibold text-sm transition-colors"
          >
            Build Your Bracket →
          </Link>
          <Link
            href="/my-brackets"
            className="inline-flex items-center justify-center px-7 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 font-medium text-sm transition-colors"
          >
            My Brackets
          </Link>
        </div>

        <p className="text-white/20 text-xs">
          Connect wallet to verify NFT eligibility
        </p>
      </div>
    </div>
  );
}

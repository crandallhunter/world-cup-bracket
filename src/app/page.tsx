import Link from 'next/link';
import { TeamOddsGrid } from '@/components/odds/TeamOddsGrid';
import { HeroOddsPanel } from '@/components/odds/HeroOddsPanel';

export default function HomePage() {
  return (
    <div className="bg-black text-white overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center px-6 sm:px-10 lg:px-16 pt-12 pb-20 overflow-hidden">

        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />

        <div className="relative w-full grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Left col ── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
              <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">
                2026 FIFA World Cup · 48 Teams · 12 Groups
              </span>
            </div>

            {/* Big headline */}
            <h1 className="text-[clamp(3rem,7vw,7rem)] font-black leading-[0.88] tracking-[-0.03em] uppercase mb-10">
              Pick every<br />
              <span className="text-[#6366f1]">match.</span><br />
              Crown your<br />
              champion.
            </h1>

            {/* Subtext + CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-14">
              <p className="text-white/40 text-base max-w-xs leading-relaxed">
                Build your full 2026 World Cup bracket — from group stage to the Final. Free to play.
              </p>
              <Link
                href="/bracket"
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-sm transition-colors"
              >
                Build Your Bracket →
              </Link>
            </div>

            {/* Stat cards */}
            <div className="flex flex-wrap gap-3">
              {[
                { value: '48', label: 'Teams' },
                { value: '12', label: 'Groups' },
                { value: '104', label: 'Matches' },
                { value: '1', label: 'Champion' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col px-5 py-3.5 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm"
                >
                  <span className="text-2xl font-black text-[#6366f1] leading-none">{s.value}</span>
                  <span className="text-xs text-white/40 mt-1 uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right col — live odds panel ── */}
          <HeroOddsPanel />
        </div>
      </section>

      {/* ── MARQUEE STRIP ───────────────────────────────────────── */}
      <div className="border-y border-white/8 bg-[#6366f1]/10 py-4 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap text-xs font-semibold text-[#6366f1]/70 uppercase tracking-[0.2em] animate-[marquee_20s_linear_infinite]">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>Group Stage</span>
              <span>·</span>
              <span>Round of 32</span>
              <span>·</span>
              <span>Quarter Finals</span>
              <span>·</span>
              <span>Semi Finals</span>
              <span>·</span>
              <span>The Final</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-24">
        <div className="flex items-center gap-3 mb-12">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/30 text-xs uppercase tracking-[0.2em]">How it works</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/6">
          {[
            { num: '01', title: 'Rank the Groups', body: 'Drag teams to predict the finishing order in all 12 groups. The top 2 from each group advance automatically.' },
            { num: '02', title: 'Pick 3rd Place', body: 'Choose which 8 of the 12 third-place finishers you think will advance to the Round of 32.' },
            { num: '03', title: 'Build the Bracket', body: 'Click through every knockout match — Round of 32, Round of 16, Quarters, Semis, and the Final.' },
            { num: '04', title: 'Crown a Champion', body: 'Pick your winner and lock in your bracket. Each submission is saved to your browser.' },
          ].map((step) => (
            <div key={step.num} className="bg-black p-8 lg:p-10 group hover:bg-white/[0.018] transition-colors">
              <span className="inline-block text-xs font-black text-white/20 tracking-widest mb-5 group-hover:text-[#6366f1]/50 transition-colors">
                {step.num}
              </span>
              <h3 className="text-2xl font-black tracking-[-0.02em] mb-3">{step.title}</h3>
              <p className="text-white/40 text-base leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BIG STATEMENT ───────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16">
        <div className="rounded-3xl bg-[#6366f1]/10 border border-[#6366f1]/20 p-10 sm:p-16">
          <p className="text-[clamp(1.5rem,4vw,3rem)] font-black leading-[1.1] tracking-[-0.02em] max-w-3xl">
            Powered by real-time Polymarket odds — see each team's tournament win probability as you build.
          </p>
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { label: 'Prediction markets', value: 'Live odds' },
              { label: 'Tournament format', value: '2026 official' },
              { label: 'Entry', value: 'Free to play' },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[#6366f1] font-bold text-lg">{f.value}</div>
                <div className="text-white/35 text-xs uppercase tracking-widest mt-0.5">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeamOddsGrid />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

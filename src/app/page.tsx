import Link from 'next/link';
import { TopContenders } from '@/components/odds/TopContenders';
import { GroupOddsGrid } from '@/components/odds/GroupOddsGrid';

export default function HomePage() {
  return (
    <div className="bg-black text-white overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden px-6 sm:px-10 lg:px-16 pt-16 pb-20">

        {/* Radial spotlight behind headline */}
        <div
          className="absolute top-[-10%] left-[20%] w-[900px] h-[700px] opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #1a0a3d 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-0 right-[-5%] w-[600px] h-[600px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto w-full">

          {/* Headline */}
          <h1 className="text-[clamp(3.5rem,8.5vw,9rem)] font-black leading-[0.88] tracking-[-0.03em] uppercase mb-10">
            <span className="text-[#6366f1]">Pick every<br />
            match.</span><br />
            Crown your<br />
            champion.<br />
            <span className="text-[#c9a84c]">Win big.</span>
          </h1>

          {/* Subtext + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-14">
            <p className="text-white/50 text-base max-w-sm leading-relaxed">
              Build your full 2026 World Cup bracket — from group stage to the Final.
            </p>
            <Link
              href="/bracket"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-sm transition-colors"
            >
              Build Your Bracket →
            </Link>
          </div>

          {/* Stat row */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: '48', label: 'Teams' },
              { value: '12', label: 'Groups' },
              { value: '104', label: 'Matches' },
              { value: '1', label: 'Champion' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col px-5 py-3.5 rounded-2xl border border-white/8 bg-white/[0.03]"
              >
                <span className="text-2xl font-black text-[#6366f1] leading-none">{s.value}</span>
                <span className="text-xs text-white/50 mt-1 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ───────────────────────────────────────── */}
      <div className="border-y border-white/8 bg-[#6366f1]/8 py-4 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap text-xs font-semibold text-[#6366f1]/60 uppercase tracking-[0.2em] animate-[marquee_20s_linear_infinite]">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>Group Stage</span><span>·</span>
              <span>Round of 32</span><span>·</span>
              <span>Quarter Finals</span><span>·</span>
              <span>Semi Finals</span><span>·</span>
              <span>The Final</span><span>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.03em] uppercase mb-4">
            How it works
          </h2>
          <p className="text-white/50 text-base mb-16 max-w-lg">
            Four steps to build your complete 2026 World Cup prediction — from groups all the way to the Final.
          </p>

          {/* 4-step horizontal row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { num: '01', title: 'Rank the Groups', body: 'Rank all 4 teams in each of the 12 groups — 1st through 4th.' },
              { num: '02', title: 'Pick 8 Third Place Teams', body: 'Each group has a third-place finisher — pick the 8 that earn a spot in the knockout round.' },
              { num: '03', title: 'Build the Bracket', body: 'Pick winners for every knockout match from the Round of 32 all the way to the Final.' },
              { num: '04', title: 'Crown a Champion', body: 'Choose the last team standing and submit your completed bracket.' },
            ].map((step, i, arr) => (
              <div key={step.num} className="relative flex flex-col pr-8 lg:pr-12 mb-12 lg:mb-0">
                {/* Circle + connector */}
                <div className="flex items-center mb-6">
                  <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                    <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
                      <span className="text-[11px] font-black text-white/40 tracking-widest">{step.num}</span>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-px ml-3 border-t border-dashed border-white/12" />
                  )}
                </div>

                <h3 className="text-lg font-black tracking-[-0.01em] mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION DIVIDER ─────────────────────────────────────── */}
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-px">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 30%, rgba(99,102,241,0.5) 70%, transparent 100%)' }} />
          </div>
        </div>
      </div>

      {/* ── ODDS SECTION ────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 pt-20 pb-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.03em] uppercase mb-4">
            What are the odds?
          </h2>
          <p className="text-white/50 text-base max-w-lg">
            Live Polymarket prediction markets — see every team's chance of lifting the trophy, right as the market sees it.
          </p>
        </div>
      </section>

      <TopContenders />
      <GroupOddsGrid />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-black text-white overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-12 pb-20 overflow-hidden">

        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">
            2026 FIFA World Cup · 48 Teams · 12 Groups
          </span>
        </div>

        {/* Big headline */}
        <h1 className="text-[clamp(3rem,10vw,8rem)] font-black leading-[0.88] tracking-[-0.03em] uppercase max-w-5xl mb-10">
          Pick every<br />
          <span className="text-[#6366f1]">match.</span><br />
          Crown your<br />
          champion.
        </h1>

        {/* Subtext + CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-16">
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

        {/* Floating stat cards */}
        <div className="flex flex-wrap gap-3">
          {[
            { value: '48', label: 'Teams' },
            { value: '12', label: 'Groups' },
            { value: '64', label: 'Matches' },
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
        <div className="flex items-center gap-3 mb-14">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/30 text-xs uppercase tracking-[0.2em]">How it works</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', title: 'Rank the Groups', body: 'Drag teams to predict the finishing order in all 12 groups.' },
            { num: '02', title: 'Pick 3rd Place', body: 'Choose which 8 third-place teams advance to the Round of 32.' },
            { num: '03', title: 'Build the Bracket', body: 'Click through each knockout match from R32 to the Final.' },
            { num: '04', title: 'Crown a Champion', body: 'Pick your winner and lock in your bracket for the challenge.' },
          ].map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden group hover:border-[#6366f1]/30 hover:bg-[#6366f1]/5 transition-colors"
            >
              <div className="text-[4rem] font-black text-white/[0.04] leading-none absolute top-4 right-4 select-none">
                {step.num}
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center mb-5">
                <span className="text-xs font-bold text-[#6366f1]">{step.num}</span>
              </div>
              <h3 className="font-bold text-base mb-2">{step.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.body}</p>
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

      {/* ── FLAGS / NATIONS ─────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-20">
        <div className="flex items-center gap-3 mb-10">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/30 text-xs uppercase tracking-[0.2em]">48 nations competing</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            '🇧🇷','🇦🇷','🇫🇷','🇩🇪','🇪🇸','🇵🇹','🇬🇧','🇳🇱',
            '🇧🇪','🇺🇸','🇲🇽','🇯🇵','🇰🇷','🇲🇦','🇸🇳','🇨🇭',
            '🇭🇷','🇺🇾','🇨🇴','🇩🇰','🇦🇹','🇸🇦','🇪🇨','🇦🇺',
            '🇳🇴','🇯🇴','🇺🇿','🇹🇳','🇨🇻','🇳🇿','🇬🇭','🇵🇦',
          ].map((flag, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-xl hover:bg-[#6366f1]/15 hover:border-[#6366f1]/30 transition-colors"
            >
              {flag}
            </div>
          ))}
          <div className="w-10 h-10 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center text-xs text-white/30 font-bold">
            +16
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 border-t border-white/6">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-[-0.03em] uppercase mb-8">
            Your bracket.<br />
            <span className="text-[#6366f1]">Your call.</span>
          </h2>
          <p className="text-white/40 text-base max-w-sm leading-relaxed mb-10">
            48 teams. One champion. Build your bracket before the tournament kicks off.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/bracket"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-sm transition-colors"
            >
              Build Your Bracket →
            </Link>
            <Link
              href="/my-brackets"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/50 hover:text-white font-medium text-sm transition-colors"
            >
              My Brackets
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

import { NextResponse } from 'next/server';
import type { GammaMarket, OddsMap, TeamOdds } from '@/types/polymarket';
import { normalizeOutcomeToTeamId } from '@/lib/polymarket/mapOdds';
import { FALLBACK_ODDS } from '@/lib/polymarket/fallbackOdds';

const GAMMA_API = 'https://gamma-api.polymarket.com/markets';

// Try multiple search queries in order of specificity
const SEARCH_QUERIES = [
  '2026 FIFA World Cup winner',
  '2026 World Cup winner',
  'World Cup 2026 champion',
  'FIFA World Cup 2026',
];

export const revalidate = 300; // 5-minute server-side cache

async function tryFetchMarket(query: string): Promise<GammaMarket | null> {
  try {
    const url = new URL(GAMMA_API);
    url.searchParams.set('search', query);
    url.searchParams.set('active', 'true');
    url.searchParams.set('limit', '20');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;
    const markets: GammaMarket[] = await res.json();

    return (
      markets
        .filter((m) => !m.closed && m.outcomes && m.outcomePrices)
        .sort((a, b) => parseFloat(b.liquidity || '0') - parseFloat(a.liquidity || '0'))
        .find((m) => {
          const q = m.question.toLowerCase();
          return q.includes('world cup') && (q.includes('winner') || q.includes('champion'));
        }) ?? null
    );
  } catch {
    return null;
  }
}

export async function GET() {
  // Try each query until we find a live market
  let targetMarket: GammaMarket | null = null;
  for (const query of SEARCH_QUERIES) {
    targetMarket = await tryFetchMarket(query);
    if (targetMarket) break;
  }

  // No live market found — return fallback odds
  if (!targetMarket) {
    return NextResponse.json(
      { ...FALLBACK_ODDS, __source: 'fallback' },
      { headers: { 'X-Odds-Source': 'fallback' } }
    );
  }

  let outcomes: string[] = [];
  let prices: string[] = [];
  try {
    outcomes = JSON.parse(targetMarket.outcomes);
    prices = JSON.parse(targetMarket.outcomePrices);
  } catch {
    return NextResponse.json(
      { ...FALLBACK_ODDS, __source: 'fallback' },
      { headers: { 'X-Odds-Source': 'fallback' } }
    );
  }

  const oddsMap: OddsMap = {};
  for (let i = 0; i < outcomes.length; i++) {
    const teamId = normalizeOutcomeToTeamId(outcomes[i]);
    if (!teamId) continue;
    const probability = parseFloat(prices[i] ?? '0');
    const teamOdds: TeamOdds = {
      teamId,
      probability,
      displayPct: `${Math.round(probability * 100)}%`,
    };
    oddsMap[teamId] = teamOdds;
  }

  return NextResponse.json(
    { ...oddsMap, __source: 'live' },
    { headers: { 'X-Odds-Source': 'live' } }
  );
}

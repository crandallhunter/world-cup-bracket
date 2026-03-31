import { NextResponse } from 'next/server';
import type { OddsMap, TeamOdds } from '@/types/polymarket';
import { normalizeOutcomeToTeamId } from '@/lib/polymarket/mapOdds';
import { FALLBACK_ODDS } from '@/lib/polymarket/fallbackOdds';

// Direct event ID for "2026 FIFA World Cup Winner"
// https://polymarket.com/event/2026-fifa-world-cup-winner-595
const EVENT_ID = '30615';
const GAMMA_EVENT_URL = `https://gamma-api.polymarket.com/events/${EVENT_ID}`;

export const revalidate = 300; // 5-minute server-side cache

interface GammaMarket {
  id: string;
  question: string;
  outcomes: string;       // JSON-encoded array e.g. '["Yes","No"]'
  outcomePrices: string;  // JSON-encoded array e.g. '["0.1625","0.8375"]'
  active: boolean;
  closed: boolean;
  liquidity?: string;
}

interface GammaEvent {
  markets: GammaMarket[];
  volume?: string;
}

export async function GET() {
  try {
    const res = await fetch(GAMMA_EVENT_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Gamma API returned ${res.status}`);

    const event: GammaEvent = await res.json();
    const markets: GammaMarket[] = event.markets ?? [];

    const oddsMap: OddsMap = {};

    for (const market of markets) {
      if (market.closed) continue;

      // Extract country name from "Will [Country] win the 2026 FIFA World Cup?"
      const match = market.question.match(/^Will (.+?) win the 2026 FIFA World Cup\??$/i);
      if (!match) continue;

      const countryName = match[1].trim();
      const teamId = normalizeOutcomeToTeamId(countryName);
      if (!teamId) continue;

      let prices: string[] = [];
      try {
        prices = JSON.parse(market.outcomePrices);
      } catch {
        continue;
      }

      // outcomePrices[0] is the Yes price
      const probability = parseFloat(prices[0] ?? '0');
      if (probability <= 0) continue;

      const teamOdds: TeamOdds = {
        teamId,
        probability,
        displayPct: `${Math.round(probability * 100)}%`,
      };
      oddsMap[teamId] = teamOdds;
    }

    if (Object.keys(oddsMap).length === 0) {
      return NextResponse.json(
        { ...FALLBACK_ODDS, __source: 'fallback' },
        { headers: { 'X-Odds-Source': 'fallback' } }
      );
    }

    return NextResponse.json(
      { ...oddsMap, __source: 'live', __volume: event.volume ?? null },
      { headers: { 'X-Odds-Source': 'live' } }
    );
  } catch {
    return NextResponse.json(
      { ...FALLBACK_ODDS, __source: 'fallback' },
      { headers: { 'X-Odds-Source': 'fallback' } }
    );
  }
}

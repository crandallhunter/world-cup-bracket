import type { OddsMap } from '@/types/polymarket';

export async function fetchWorldCupOdds(): Promise<OddsMap> {
  const res = await fetch('/api/odds', { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch odds: ${res.status}`);
  return res.json() as Promise<OddsMap>;
}

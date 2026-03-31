'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { OddsMap } from '@/types/polymarket';

interface OddsContextValue {
  odds: OddsMap;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  volume: string | null;
}

const OddsContext = createContext<OddsContextValue>({
  odds: {},
  isLive: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
  volume: null,
});

const POLL_INTERVAL = 5 * 60 * 1000;

export function OddsProvider({ children }: { children: React.ReactNode }) {
  const [odds, setOdds] = useState<OddsMap>({});
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [volume, setVolume] = useState<string | null>(null);

  async function fetchOdds() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/odds');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Strip internal keys before storing
      const source = data.__source as string | undefined;
      const rawVolume = data.__volume as string | undefined | null;
      const { __source: _s, __volume: _v, ...cleanData } = data;

      setOdds(cleanData as OddsMap);
      if (rawVolume) setVolume(rawVolume);
      setIsLive(source === 'live');
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch odds');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOdds();
    const interval = setInterval(fetchOdds, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <OddsContext.Provider value={{ odds, isLive, isLoading, error, lastUpdated, volume }}>
      {children}
    </OddsContext.Provider>
  );
}

export function useOddsContext() {
  return useContext(OddsContext);
}

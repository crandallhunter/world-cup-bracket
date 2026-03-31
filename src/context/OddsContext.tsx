'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { OddsMap } from '@/types/polymarket';

interface OddsContextValue {
  odds: OddsMap;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const OddsContext = createContext<OddsContextValue>({
  odds: {},
  isLive: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
});

const POLL_INTERVAL = 5 * 60 * 1000;

export function OddsProvider({ children }: { children: React.ReactNode }) {
  const [odds, setOdds] = useState<OddsMap>({});
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  async function fetchOdds() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/odds');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Strip internal __source key before storing
      const source = data.__source as string | undefined;
      const { __source: _, ...cleanData } = data;

      setOdds(cleanData as OddsMap);
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
    <OddsContext.Provider value={{ odds, isLive, isLoading, error, lastUpdated }}>
      {children}
    </OddsContext.Provider>
  );
}

export function useOddsContext() {
  return useContext(OddsContext);
}

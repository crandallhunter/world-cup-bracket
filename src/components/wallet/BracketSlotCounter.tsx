'use client';

import { useNFTBalance } from '@/lib/web3/hooks/useNFTBalance';
import { useBracketStore } from '@/store/bracketStore';

export function BracketSlotCounter() {
  const { balance, isConnected } = useNFTBalance();
  const submittedBrackets = useBracketStore((s) => s.submittedBrackets);

  if (!isConnected || balance === 0) return null;

  const used = submittedBrackets.length;
  const remaining = balance - used;

  return (
    <span className="text-xs text-white/30 tabular-nums hidden sm:block">
      {remaining}/{balance} brackets
    </span>
  );
}

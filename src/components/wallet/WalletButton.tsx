'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import Link from 'next/link';

function AccountDropdown({ address, ensName, onClose }: {
  address: string;
  ensName: string | null | undefined;
  onClose: () => void;
}) {
  const { disconnect } = useDisconnect();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-black shadow-2xl z-50 overflow-hidden"
    >
      {/* Address header */}
      <div className="px-4 py-3 border-b border-white/8">
        {ensName && (
          <div className="text-sm font-semibold text-white mb-0.5">{ensName}</div>
        )}
        <div className="font-mono text-xs text-white/40 break-all">{short}</div>
      </div>

      {/* Links */}
      <div className="py-1">
        <Link
          href="/my-brackets"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-base">📋</span>
          My Brackets
        </Link>
      </div>

      {/* Disconnect */}
      <div className="border-t border-white/8 py-1">
        <button
          onClick={() => { disconnect(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
        >
          <span className="text-base">→</span>
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function WalletButton() {
  const [open, setOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-white/40 shrink-0" />
          <span className="font-mono text-white/80">
            {ensName ?? `…${address.slice(-4)}`}
          </span>
        </button>
        {open && (
          <AccountDropdown
            address={address}
            ensName={ensName}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={openConnectModal}
      className="px-4 py-1.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/85 transition-colors"
    >
      Connect Wallet
    </button>
  );
}

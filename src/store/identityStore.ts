import { create } from 'zustand';

/**
 * Tracks the user's identity choice from the welcome modal.
 * Persisted in localStorage so returning users skip the welcome flow.
 */

export type IdentityChoice =
  | { type: 'wallet' }
  | { type: 'email'; email: string }
  | { type: 'explore' }
  | null;

const STORAGE_KEY = 'wcb_identity';

function loadIdentity(): IdentityChoice {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IdentityChoice;
  } catch {
    return null;
  }
}

function saveIdentity(identity: IdentityChoice) {
  if (typeof window === 'undefined') return;
  if (identity) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface IdentityStore {
  /** The user's identity choice — null means they haven't chosen yet */
  identity: IdentityChoice;
  /** Whether the welcome modal has been dismissed this session */
  hasSeenWelcome: boolean;
  /** Set identity from welcome modal */
  setIdentity: (identity: IdentityChoice) => void;
  /** Mark welcome as seen (for explore mode) */
  markWelcomeSeen: () => void;
  /** Reset (for testing / sign out) */
  resetIdentity: () => void;
}

export const useIdentityStore = create<IdentityStore>((set) => ({
  identity: null,
  hasSeenWelcome: false,

  setIdentity: (identity) => {
    saveIdentity(identity);
    set({ identity, hasSeenWelcome: true });
  },

  markWelcomeSeen: () => {
    set({ hasSeenWelcome: true });
  },

  resetIdentity: () => {
    saveIdentity(null);
    set({ identity: null, hasSeenWelcome: false });
  },
}));

// Hydrate from localStorage on client
if (typeof window !== 'undefined') {
  const stored = loadIdentity();
  if (stored) {
    useIdentityStore.setState({ identity: stored, hasSeenWelcome: true });
  }
}

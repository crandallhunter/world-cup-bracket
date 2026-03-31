import type { BracketSubmission } from '@/types/tournament';

const STORAGE_KEY_PREFIX = 'wcb_submissions_';

function getKey(address: string): string {
  return `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
}

export function loadSubmissions(address: string): BracketSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(address));
    if (!raw) return [];
    return JSON.parse(raw) as BracketSubmission[];
  } catch {
    return [];
  }
}

export function saveSubmission(
  address: string,
  submission: BracketSubmission
): void {
  if (typeof window === 'undefined') return;
  const existing = loadSubmissions(address);
  const updated = [...existing, submission];
  localStorage.setItem(getKey(address), JSON.stringify(updated));
}

export function countSubmissions(address: string): number {
  return loadSubmissions(address).length;
}

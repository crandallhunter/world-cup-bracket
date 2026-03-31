import type { BracketSubmission } from '@/types/tournament';

const STORAGE_KEY_PREFIX = 'wcb_submissions_';
const ANON_ID_KEY = 'wcb_anon_id';

export function getAnonId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getKey(id: string): string {
  return `${STORAGE_KEY_PREFIX}${id}`;
}

export function loadSubmissions(id: string): BracketSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(id));
    if (!raw) return [];
    return JSON.parse(raw) as BracketSubmission[];
  } catch {
    return [];
  }
}

export function saveSubmission(id: string, submission: BracketSubmission): void {
  if (typeof window === 'undefined') return;
  const existing = loadSubmissions(id);
  const updated = [...existing, submission];
  localStorage.setItem(getKey(id), JSON.stringify(updated));
}

export function countSubmissions(id: string): number {
  return loadSubmissions(id).length;
}

// ─── Local JSON file data store ──────────────────────────────────────────────
// Development-only implementation using a JSON file in the project root.
// Swap this out for your production database by implementing the DataStore
// interface with your real DB client.
//
// Data is stored at: <project-root>/data/store.json

import { promises as fs } from 'fs';
import path from 'path';
import type { DataStore, Submission, UsedToken, SubmissionScore, FixtureResult } from './types';
import type { RealResults } from '@/lib/scoring';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoreData {
  submissions: Submission[];
  usedTokens: UsedToken[];
  results?: RealResults;
  scores?: SubmissionScore[];
  fixtures?: FixtureResult[];
}

const EMPTY_STORE: StoreData = { submissions: [], usedTokens: [] };

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as StoreData;
  } catch {
    return { ...EMPTY_STORE };
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await ensureDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── DataStore implementation ────────────────────────────────────────────────

export const localStore: DataStore = {
  async createSubmission(submission) {
    const store = await readStore();
    store.submissions.push(submission);
    await writeStore(store);
  },

  async getSubmissionById(id) {
    const store = await readStore();
    return store.submissions.find((s) => s.id === id) ?? null;
  },

  async getSubmissionByIdentity(identifier) {
    const store = await readStore();
    const normalized = identifier.toLowerCase();
    return (
      store.submissions.find(
        (s) => s.identifier.toLowerCase() === normalized
      ) ?? null
    );
  },

  async getAllSubmissions() {
    const store = await readStore();
    return store.submissions;
  },

  async deleteSubmission(id) {
    const store = await readStore();
    store.submissions = store.submissions.filter((s) => s.id !== id);
    await writeStore(store);
  },

  async lockTokens(tokens) {
    const store = await readStore();
    store.usedTokens.push(...tokens);
    await writeStore(store);
  },

  async getUsedTokenIds() {
    const store = await readStore();
    return store.usedTokens;
  },

  async filterUsedTokens(tokenIds) {
    const store = await readStore();
    const usedSet = new Set(store.usedTokens.map((t) => t.tokenId));
    return tokenIds.filter((id) => usedSet.has(id));
  },

  async unlockTokensForSubmission(submissionId) {
    const store = await readStore();
    store.usedTokens = store.usedTokens.filter(
      (t) => t.submissionId !== submissionId
    );
    await writeStore(store);
  },

  async saveResults(results) {
    const store = await readStore();
    store.results = results;
    await writeStore(store);
  },

  async getResults() {
    const store = await readStore();
    return store.results ?? null;
  },

  async saveScores(scores) {
    const store = await readStore();
    store.scores = scores;
    await writeStore(store);
  },

  async getScores() {
    const store = await readStore();
    return (store.scores ?? []).sort((a, b) => {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      // Tiebreaker: lower is better
      if (a.tiebreaker !== null && b.tiebreaker !== null) return a.tiebreaker - b.tiebreaker;
      if (a.tiebreaker !== null) return -1;
      if (b.tiebreaker !== null) return 1;
      return 0;
    });
  },

  async saveFixtures(fixtures) {
    const store = await readStore();
    store.fixtures = fixtures;
    await writeStore(store);
  },

  async getFixtures() {
    const store = await readStore();
    return store.fixtures ?? [];
  },
};

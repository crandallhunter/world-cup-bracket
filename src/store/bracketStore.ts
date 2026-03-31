import { create } from 'zustand';
import type {
  BracketStep,
  BracketSubmission,
  FinalScore,
  GroupLabel,
  GroupStanding,
  KnockoutMatch,
  Team,
} from '@/types/tournament';
import { GROUP_LABELS, GROUPS } from '@/lib/tournament/teams';
import { buildFullBracket, propagateWinner } from '@/lib/tournament/r32Seeding';
import { saveSubmission, loadSubmissions } from '@/lib/storage/brackets';
import type { ThirdPlaceTeam } from '@/lib/tournament/thirdPlace';

function defaultStandings(): Record<GroupLabel, GroupStanding> {
  const s = {} as Record<GroupLabel, GroupStanding>;
  for (const g of GROUP_LABELS) {
    const teams = GROUPS[g];
    s[g] = {
      group: g,
      rankings: [teams[0], teams[1], teams[2], teams[3]] as [Team, Team, Team, Team],
      isComplete: false,
    };
  }
  return s;
}

interface BracketStore {
  // ─── Steps ─────────────────────────────────────────────────────────────────
  currentStep: BracketStep;
  currentGroupIndex: number; // 0–11 (A–L)

  // ─── Group Stage ────────────────────────────────────────────────────────────
  groupStandings: Record<GroupLabel, GroupStanding>;

  // ─── Third Place ────────────────────────────────────────────────────────────
  selectedThirdPlace: ThirdPlaceTeam[]; // exactly 8 teams

  // ─── Knockout Bracket ───────────────────────────────────────────────────────
  knockoutBracket: KnockoutMatch[];

  // ─── Final Score Prediction ─────────────────────────────────────────────────
  finalScore: FinalScore | null;

  // ─── Submissions ────────────────────────────────────────────────────────────
  submittedBrackets: BracketSubmission[];

  // ─── Actions ────────────────────────────────────────────────────────────────
  setGroupRanking: (group: GroupLabel, rankings: [Team, Team, Team, Team]) => void;
  markGroupComplete: (group: GroupLabel) => void;
  setSelectedThirdPlace: (teams: ThirdPlaceTeam[]) => void;
  rebuildKnockoutBracket: () => void;
  setKnockoutPick: (matchId: string, winner: Team) => void;
  setFinalScore: (score: FinalScore) => void;
  goToStep: (step: BracketStep) => void;
  goToNextGroup: () => void;
  goToPrevGroup: () => void;
  submitBracket: (walletAddress: string, nftBalance: number) => { success: boolean; error?: string };
  loadSubmissionsForAddress: (walletAddress: string) => void;
  resetBracket: () => void;
}

export const useBracketStore = create<BracketStore>((set, get) => ({
  currentStep: 'GROUPS',
  currentGroupIndex: 0,
  groupStandings: defaultStandings(),
  selectedThirdPlace: [],
  knockoutBracket: [],
  finalScore: null,
  submittedBrackets: [],

  setGroupRanking: (group, rankings) => {
    set((state) => ({
      groupStandings: {
        ...state.groupStandings,
        [group]: { ...state.groupStandings[group], rankings },
      },
    }));
  },

  markGroupComplete: (group) => {
    set((state) => ({
      groupStandings: {
        ...state.groupStandings,
        [group]: { ...state.groupStandings[group], isComplete: true },
      },
    }));
  },

  setSelectedThirdPlace: (teams) => {
    set({ selectedThirdPlace: teams });
  },

  rebuildKnockoutBracket: () => {
    const { groupStandings, selectedThirdPlace } = get();
    const bracket = buildFullBracket(groupStandings, selectedThirdPlace);
    set({ knockoutBracket: bracket });
  },

  setKnockoutPick: (matchId, winner) => {
    const { knockoutBracket } = get();
    const updated = propagateWinner(knockoutBracket, matchId, winner);
    set({ knockoutBracket: updated });
  },

  setFinalScore: (score) => set({ finalScore: score }),

  goToStep: (step) => set({ currentStep: step }),

  goToNextGroup: () => {
    const { currentGroupIndex, groupStandings } = get();
    const currentGroup = GROUP_LABELS[currentGroupIndex];
    // Auto-mark current group complete on next
    set((state) => ({
      groupStandings: {
        ...state.groupStandings,
        [currentGroup]: { ...state.groupStandings[currentGroup], isComplete: true },
      },
      currentGroupIndex: Math.min(currentGroupIndex + 1, 11),
    }));
    // If we just completed the last group, move to third place step
    if (currentGroupIndex === 11) {
      set({ currentStep: 'THIRD_PLACE' });
    }
  },

  goToPrevGroup: () => {
    set((state) => ({
      currentGroupIndex: Math.max(state.currentGroupIndex - 1, 0),
      currentStep: 'GROUPS',
    }));
  },

  submitBracket: (walletAddress, nftBalance) => {
    const { submittedBrackets, groupStandings, selectedThirdPlace, knockoutBracket } = get();
    if (submittedBrackets.length >= nftBalance) {
      return { success: false, error: 'You have used all your bracket submissions.' };
    }
    const finalMatch = knockoutBracket.find((m) => m.round === 'F');
    const { finalScore } = get();
    const submission: BracketSubmission = {
      id: crypto.randomUUID(),
      walletAddress,
      submittedAt: Date.now(),
      groupStandings: Object.values(groupStandings),
      qualifiedThirdPlace: selectedThirdPlace,
      knockoutPicks: knockoutBracket,
      champion: finalMatch?.winner,
      finalScore: finalScore ?? undefined,
    };
    saveSubmission(walletAddress, submission);
    set((state) => ({
      submittedBrackets: [...state.submittedBrackets, submission],
      currentStep: 'SUBMITTED',
    }));
    return { success: true };
  },

  loadSubmissionsForAddress: (walletAddress) => {
    const submissions = loadSubmissions(walletAddress);
    set({ submittedBrackets: submissions });
  },

  resetBracket: () => {
    set({
      currentStep: 'GROUPS',
      currentGroupIndex: 0,
      groupStandings: defaultStandings(),
      selectedThirdPlace: [],
      knockoutBracket: [],
      finalScore: null,
    });
  },
}));

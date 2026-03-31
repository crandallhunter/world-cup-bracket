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
import { saveSubmission, loadSubmissions, getAnonId } from '@/lib/storage/brackets';
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
  currentStep: BracketStep;
  currentGroupIndex: number;
  groupStandings: Record<GroupLabel, GroupStanding>;
  selectedThirdPlace: ThirdPlaceTeam[];
  knockoutBracket: KnockoutMatch[];
  finalScore: FinalScore | null;
  submittedBrackets: BracketSubmission[];

  setGroupRanking: (group: GroupLabel, rankings: [Team, Team, Team, Team]) => void;
  markGroupComplete: (group: GroupLabel) => void;
  setSelectedThirdPlace: (teams: ThirdPlaceTeam[]) => void;
  rebuildKnockoutBracket: () => void;
  setKnockoutPick: (matchId: string, winner: Team) => void;
  setFinalScore: (score: FinalScore) => void;
  goToStep: (step: BracketStep) => void;
  goToNextGroup: () => void;
  goToPrevGroup: () => void;
  submitBracket: () => { success: boolean; error?: string };
  loadSubmissionsForAddress: (id: string) => void;
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
    set((state) => ({
      groupStandings: {
        ...state.groupStandings,
        [currentGroup]: { ...state.groupStandings[currentGroup], isComplete: true },
      },
      currentGroupIndex: Math.min(currentGroupIndex + 1, 11),
    }));
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

  submitBracket: () => {
    const { groupStandings, selectedThirdPlace, knockoutBracket } = get();
    const anonId = getAnonId();
    const finalMatch = knockoutBracket.find((m) => m.round === 'F');
    const { finalScore } = get();
    const submission: BracketSubmission = {
      id: crypto.randomUUID(),
      walletAddress: anonId,
      submittedAt: Date.now(),
      groupStandings: Object.values(groupStandings),
      qualifiedThirdPlace: selectedThirdPlace,
      knockoutPicks: knockoutBracket,
      champion: finalMatch?.winner,
      finalScore: finalScore ?? undefined,
    };
    saveSubmission(anonId, submission);
    set((state) => ({
      submittedBrackets: [...state.submittedBrackets, submission],
      currentStep: 'SUBMITTED',
    }));
    return { success: true };
  },

  loadSubmissionsForAddress: (id) => {
    const submissions = loadSubmissions(id);
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

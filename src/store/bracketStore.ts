import { create } from 'zustand';
import type {
  BracketStep,
  FinalScore,
  GroupLabel,
  GroupStanding,
  KnockoutMatch,
  Team,
} from '@/types/tournament';
import { GROUP_LABELS, GROUPS } from '@/lib/tournament/teams';
import { buildFullBracket, propagateWinner } from '@/lib/tournament/r32Seeding';
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
  groupStandings: Record<GroupLabel, GroupStanding>;
  selectedThirdPlace: ThirdPlaceTeam[];
  knockoutBracket: KnockoutMatch[];
  finalScore: FinalScore | null;

  setGroupRanking: (group: GroupLabel, rankings: [Team, Team, Team, Team]) => void;
  markAllGroupsComplete: () => void;
  setSelectedThirdPlace: (teams: ThirdPlaceTeam[]) => void;
  rebuildKnockoutBracket: () => void;
  setKnockoutPick: (matchId: string, winner: Team) => void;
  setFinalScore: (score: FinalScore) => void;
  goToStep: (step: BracketStep) => void;
  /** Mark bracket as submitted (updates step to SUBMITTED) */
  markSubmitted: () => void;
  /** Reset all bracket state for a new submission */
  resetBracket: () => void;
}

/** Zustand store for the bracket builder — groups, knockout picks, score, and step navigation. */
export const useBracketStore = create<BracketStore>((set, get) => ({
  currentStep: 'GROUPS',
  groupStandings: defaultStandings(),
  selectedThirdPlace: [],
  knockoutBracket: [],
  finalScore: null,

  setGroupRanking: (group, rankings) => {
    set((state) => ({
      groupStandings: {
        ...state.groupStandings,
        [group]: { ...state.groupStandings[group], rankings },
      },
    }));
  },

  markAllGroupsComplete: () => {
    set((state) => {
      const updated = { ...state.groupStandings };
      for (const g of GROUP_LABELS) {
        updated[g] = { ...updated[g], isComplete: true };
      }
      return { groupStandings: updated };
    });
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

  markSubmitted: () => {
    set({ currentStep: 'SUBMITTED' });
  },

  resetBracket: () => {
    set({
      currentStep: 'GROUPS',
      groupStandings: defaultStandings(),
      selectedThirdPlace: [],
      knockoutBracket: [],
      finalScore: null,
    });
  },
}));

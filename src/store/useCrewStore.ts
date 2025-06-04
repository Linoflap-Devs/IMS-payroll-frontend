import { create } from 'zustand';
import {
  getCrewList,
  getCrewDetails,
  getCrewBasic,
  getCrewMovement,
  getCrewAllottee,
  getCrewRankList,
  CrewItem,
  CrewDetails,
  CrewBasic,
  CrewMovement,
  CrewAllottee,
  CrewRankItem,
} from '../services/crew/crew.api';
import { getCrewValidationDetails } from '../services/crew/crewValidation.api';
import { ICrewValidationDetails } from "@/types/crewValidation";


interface CrewStore {
  // Crew list state
  crews: CrewItem[];
  isLoading: boolean;
  error: string | null;

  // Crew details state
  crewDetails: CrewDetails | null;
  isLoadingDetails: boolean;
  detailsError: string | null;

  // Crew basic state
  crewBasic: CrewBasic | null;
  isLoadingBasic: boolean;
  basicError: string | null;

  // Crew movement state
  movements: CrewMovement[];
  isLoadingMovements: boolean;
  movementsError: string | null;

  // Crew allottee state
  allottees: CrewAllottee[];
  isLoadingAllottees: boolean;
  allotteesError: string | null;

  // Crew validation state
  crewValidationDetails: ICrewValidationDetails | null;
  isLoadingValidationDetails: boolean;
  crewValidationError: string | null;

  // Crew rank state
  crewRanks: CrewRankItem[];
  isLoadingRanks: boolean;
  ranksError: string | null;

  // Actions
  fetchCrews: () => Promise<void>;
  fetchCrewDetails: (crewCode: string) => Promise<void>;
  fetchCrewBasic: (crewCode: string) => Promise<void>;
  fetchCrewMovements: (crewCode: string) => Promise<void>;
  fetchCrewAllottees: (crewCode: string) => Promise<void>;
  fetchCrewValidationDetails: (crewCode: string) => Promise<void>;
  fetchCrewRanks: () => Promise<void>;
  resetDetails: () => void;
  resetBasic: () => void;
  resetMovements: () => void;
  resetAllottees: () => void;
  resetRanks: () => void;

}

export const useCrewStore = create<CrewStore>((set) => ({
  // Initial state
  crews: [],
  isLoading: false,
  error: null,
  crewDetails: null,
  isLoadingDetails: false,
  detailsError: null,
  crewBasic: null,
  isLoadingBasic: false,
  basicError: null,
  movements: [],
  isLoadingMovements: false,
  movementsError: null,
  allottees: [],
  isLoadingAllottees: false,
  allotteesError: null,
  crewValidationDetails: null,
  isLoadingValidationDetails: false,
  crewValidationError: null,

  crewRanks: [],
  isLoadingRanks: false,
  ranksError: null,


  // Actions
  fetchCrews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCrewList();
      if (response.success) {
        set({ crews: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch crews', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred while fetching crews',
        isLoading: false
      });
    }
  },

  fetchCrewDetails: async (crewCode: string) => {
    set({ isLoadingDetails: true, detailsError: null });
    try {
      const response = await getCrewDetails(crewCode);
      if (response.success) {
        set({ crewDetails: response.data, isLoadingDetails: false });
      } else {
        set({
          detailsError: response.message || 'Failed to fetch crew details',
          isLoadingDetails: false
        });
      }
      console.log('Crew Details:', response.data);
    } catch (error) {
      set({
        detailsError: error instanceof Error ? error.message : 'An error occurred while fetching crew details',
        isLoadingDetails: false
      });
    }
  },

  fetchCrewBasic: async (crewCode: string) => {
    set({ isLoadingBasic: true, basicError: null });
    try {
      const response = await getCrewBasic(crewCode);
      if (response.success) {
        set({ crewBasic: response.data, isLoadingBasic: false });
      } else {
        set({
          basicError: response.message || 'Failed to fetch crew basic information',
          isLoadingBasic: false
        });
      }
    } catch (error) {
      set({
        basicError: error instanceof Error ? error.message : 'An error occurred while fetching crew basic information',
        isLoadingBasic: false
      });
    }
  },

  fetchCrewMovements: async (crewCode: string) => {
    set({ isLoadingMovements: true, movementsError: null });
    try {
      const response = await getCrewMovement(crewCode);
      if (response.success) {
        set({ movements: response.data, isLoadingMovements: false });
      } else {
        set({
          movementsError: response.message || 'Failed to fetch crew movements',
          isLoadingMovements: false
        });
      }
    } catch (error) {
      set({
        movementsError: error instanceof Error ? error.message : 'An error occurred while fetching crew movements',
        isLoadingMovements: false
      });
    }
  },

  fetchCrewAllottees: async (crewCode: string) => {
    set({ isLoadingAllottees: true, allotteesError: null });
    try {
      const response = await getCrewAllottee(crewCode);
      if (response.success) {
        set({ allottees: response.data, isLoadingAllottees: false });
      } else {
        set({
          allotteesError: response.message || 'Failed to fetch crew allottees',
          isLoadingAllottees: false
        });
      }
    } catch (error) {
      set({
        allotteesError: error instanceof Error ? error.message : 'An error occurred while fetching crew allottees',
        isLoadingAllottees: false
      });
    }
  },
  fetchCrewValidationDetails: async (crewCode: string) => {
    set({ isLoadingValidationDetails: true });
    try {

      const response = await getCrewValidationDetails(crewCode);
      if (response.success) {
        set({ crewValidationDetails: response.data, isLoadingValidationDetails: false });
      }
      else {
        set({
          crewValidationError: response.message || 'Failed to fetch crew validation details',
          isLoadingValidationDetails: false
        });
      }
    } catch (error) {
      const err = error as Error
      set({
        crewValidationError: err.message || 'An error occurred while fetching crew validation details',
        isLoadingValidationDetails: false
      });
    }

  },
  fetchCrewRanks: async () => {
    set({ isLoadingRanks: true, ranksError: null });
    try {
      const response = await getCrewRankList();
      if (response.success) {
        set({ crewRanks: response.data, isLoadingRanks: false });
      } else {
        set({
          ranksError: response.message || 'Failed to fetch crew ranks',
          isLoadingRanks: false
        });
      }
    } catch (error) {
      set({
        ranksError: error instanceof Error ? error.message : 'An error occurred while fetching crew ranks',
        isLoadingRanks: false
      });
    }
  },

  resetDetails: () => set({ crewDetails: null, isLoadingDetails: false, detailsError: null }),
  resetBasic: () => set({ crewBasic: null, isLoadingBasic: false, basicError: null }),
  resetMovements: () => set({ movements: [], isLoadingMovements: false, movementsError: null }),
  resetAllottees: () => set({ allottees: [], isLoadingAllottees: false, allotteesError: null }),
  resetRanks: () => set({ crewRanks: [], isLoadingRanks: false, ranksError: null }),
}));

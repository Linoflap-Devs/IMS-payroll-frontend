import { create } from 'zustand';
import { 
  getCrewList, 
  getCrewDetails,
  getCrewMovement,
  getCrewAllottee,
  CrewItem, 
  CrewDetails,
  CrewMovement,
  CrewAllottee
} from '../services/crew/crew.api';

interface CrewStore {
  // Crew list state
  crews: CrewItem[];
  isLoading: boolean;
  error: string | null;
  
  // Crew details state
  crewDetails: CrewDetails | null;
  isLoadingDetails: boolean;
  detailsError: string | null;

  // Crew movement state
  movements: CrewMovement[];
  isLoadingMovements: boolean;
  movementsError: string | null;

  // Crew allottee state
  allottees: CrewAllottee[];
  isLoadingAllottees: boolean;
  allotteesError: string | null;

  // Actions
  fetchCrews: () => Promise<void>;
  fetchCrewDetails: (crewCode: string) => Promise<void>;
  fetchCrewMovements: (crewCode: string) => Promise<void>;
  fetchCrewAllottees: (crewCode: string) => Promise<void>;
  resetDetails: () => void;
  resetMovements: () => void;
  resetAllottees: () => void;
}

export const useCrewStore = create<CrewStore>((set) => ({
  // Initial state
  crews: [],
  isLoading: false,
  error: null,
  crewDetails: null,
  isLoadingDetails: false,
  detailsError: null,
  movements: [],
  isLoadingMovements: false,
  movementsError: null,
  allottees: [],
  isLoadingAllottees: false,
  allotteesError: null,

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
    } catch (error) {
      set({ 
        detailsError: error instanceof Error ? error.message : 'An error occurred while fetching crew details',
        isLoadingDetails: false 
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

  resetDetails: () => {
    set({ 
      crewDetails: null, 
      isLoadingDetails: false, 
      detailsError: null 
    });
  },

  resetMovements: () => {
    set({
      movements: [],
      isLoadingMovements: false,
      movementsError: null
    });
  },

  resetAllottees: () => {
    set({
      allottees: [],
      isLoadingAllottees: false,
      allotteesError: null
    });
  },
}));
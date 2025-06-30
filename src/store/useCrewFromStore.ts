import { create } from "zustand";

interface Crew {
  id: number;
  name: string;
  phone?: string;
  landline?: string;
  email?: string;
  // etc.
}

interface CrewStore {
  crew: Crew | null;
  setCrew: (crew: Crew) => void;
  updateCrew: (updates: Partial<Crew>) => void;
}

export const useCrewStore = create<CrewStore>((set) => ({
  crew: null,
  setCrew: (crew) => set({ crew }),
  updateCrew: (updates) =>
    set((state) => {
      if (!state.crew) return {};
      return {
        crew: {
          ...state.crew,
          ...updates,
        },
      };
    }),
}));

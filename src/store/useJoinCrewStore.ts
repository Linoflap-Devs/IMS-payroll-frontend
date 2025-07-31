import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ISelectedCrew {
  RankID?: any;
  ProfileImage?: any;
  id: number;
  name: string;
  status: string;
  rank: string;
  crewCode: string;
  currentVessel?: string;
  vesselId?: number;
}

interface JoinCrewStore {
  selectedCrew: ISelectedCrew[];
  setSelectedCrew: (crew: ISelectedCrew[]) => void;
  clearSelectedCrew: () => void;
}

export const useJoinCrewStore = create<JoinCrewStore>()(
  persist(
    (set) => ({
      selectedCrew: [],
      setSelectedCrew: (crew) => set({ selectedCrew: crew }),
      clearSelectedCrew: () => set({ selectedCrew: [] }),
    }),
    {
      name: "join-crew-storage", // key in localStorage
    }
  )
);
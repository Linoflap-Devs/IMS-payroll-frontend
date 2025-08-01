import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ISelectedCrew {
  id: number;
  name: string;
  status: string;
  rank: string;
  crewCode: string;
  vesselId?: number;
  selectedVesselId?: string;
  selectedVesselName?: string;
  ProfileImage?: any;
}

interface JoinCrewStore {
  selectedCrew: ISelectedCrew[];
  selectedVesselName: string;
  setSelectedCrew: (crew: ISelectedCrew[]) => void;
  clearSelectedCrew: () => void;
  updateCrewRank: (id: number, newRank: string) => void;
}

export const useJoinCrewStore = create<JoinCrewStore>((set) => ({
  selectedCrew: [],
  selectedVesselName: "",
  setSelectedCrew: (crew) => set({ selectedCrew: crew }),
  clearSelectedCrew: () => set({ selectedCrew: [] }),
  updateCrewRank: (id, newRank) =>
    set((state) => ({
      selectedCrew: state.selectedCrew.map((crew) =>
        crew.id === id ? { ...crew, rank: newRank } : crew
      ),
    })),
}));

// export const useJoinCrewStore = create<JoinCrewStore>()(
//   persist(
//     (set) => ({
//       selectedCrew: [],
//       setSelectedCrew: (crew) => set({ selectedCrew: crew }),
//       clearSelectedCrew: () => set({ selectedCrew: [] }),
//     }),
//     {
//       name: "join-crew-storage", // key in localStorage
//     }
//   )
// );
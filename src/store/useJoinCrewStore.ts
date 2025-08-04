import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ISelectedCrew {
  //CrewID: any;
  portId?: undefined;
  signOnDate?: any;
  id: number;
  name: string;
  status: string;
  rank: string;
  rankId: number;
  crewCode: string;
  vesselId?: number;
  selectedVesselName?: string;
  ProfileImage?: any;
}

interface JoinCrewStore {
  selectedCrew: ISelectedCrew[];
  selectedVesselName: string;
  setSelectedCrew: (crew: ISelectedCrew[]) => void;
  clearSelectedCrew: () => void;
  updateCrewRank: (crewCode: string, newRank: string) => void;
}

export const useJoinCrewStore = create<JoinCrewStore>((set) => ({
  selectedCrew: [],
  selectedVesselName: "",
  setSelectedCrew: (crew) => set({ selectedCrew: crew }),
  clearSelectedCrew: () => set({ selectedCrew: [] }),
  updateCrewRank: (crewCode: string, newRankId: string) =>
    set((state) => ({
      selectedCrew: state.selectedCrew.map((crew) =>
        crew.crewCode === crewCode
          ? { ...crew, rankId: Number(newRankId) }
          : crew
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
import { create } from "zustand";
import {
  getWageDescriptionList,
} from "@/src/services/wages/wageDescription.api";
import type { WageDescriptionResponse } from "@/src/services/wages/wageDescription.api";
import { getVesselTypeList, VesselTypeResponse } from "../services/vessel/vesselType.api";
import { getCrewRankList, CrewRankResponse } from "@/src/services/crew/crew.api";

type ReferenceState = {
  vesselTypes: VesselTypeResponse["data"];
  wageDescriptions: WageDescriptionResponse["data"];
  crewRanks: CrewRankResponse["data"];

  isLoading: boolean;
  error: string | null;

  fetchVesselTypes: () => Promise<void>;
  fetchWageDescriptions: () => Promise<void>;
  fetchCrewRanks: () => Promise<void>;
  fetchAllReferences: () => Promise<void>;
};

export const useReferenceStore = create<ReferenceState>((set, get) => ({
  vesselTypes: [],
  wageDescriptions: [],
  crewRanks: [],

  isLoading: false,
  error: null,

  fetchVesselTypes: async () => {
    const { vesselTypes } = get();
    if (vesselTypes.length > 0) return;

    try {
      set({ isLoading: true, error: null });
      const res = await getVesselTypeList();
      if (res.success) {
        set({ vesselTypes: res.data });
      } else {
        set({ error: res.message || "Failed to load vessel types" });
      }
    } catch (err) {
      set({ error: "Error fetching vessel types" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWageDescriptions: async () => {
    const { wageDescriptions } = get();
    if (wageDescriptions.length > 0) return;

    try {
      set({ isLoading: true, error: null });
      const res = await getWageDescriptionList();
      if (res.success) {
        set({ wageDescriptions: res.data });
      } else {
        set({ error: res.message || "Failed to load wage descriptions" });
      }
    } catch (err) {
      set({ error: "Error fetching wage descriptions" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCrewRanks: async () => {
    const { crewRanks } = get();
    if (crewRanks.length > 0) return;

    try {
      set({ isLoading: true, error: null });
      const res = await getCrewRankList();
      if (res.success) {
        set({ crewRanks: res.data });
      } else {
        set({ error: res.message || "Failed to load crew ranks" });
      }
    } catch (err) {
      set({ error: "Error fetching crew ranks" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllReferences: async () => {
    await Promise.all([
      get().fetchVesselTypes(),
      get().fetchWageDescriptions(),
      get().fetchCrewRanks(),
    ]);
  },
}));

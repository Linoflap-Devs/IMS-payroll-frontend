import { create } from "zustand";
import { AllotteeApiModel } from "@/types/crewAllottee";

interface AddAllotteeStore {
  newAllottee: AllotteeApiModel | null;
  setNewAllottee: (allottee: AllotteeApiModel) => void;
  resetAllottee: () => void;
}

export const useAddAllotteeStore = create<AddAllotteeStore>((set) => ({
  newAllottee: null,
  setNewAllottee: (allottee) => set({ newAllottee: allottee }),
  resetAllottee: () => set({ newAllottee: null }),
}));

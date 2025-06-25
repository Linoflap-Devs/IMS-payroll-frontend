import { create } from "zustand";

interface AllotteeFormStore {
  isAllotteeValid: boolean;
  setIsAllotteeValid: (valid: boolean) => void;
}

export const useAllotteeFormStore = create<AllotteeFormStore>((set) => ({
  isAllotteeValid: false,
  setIsAllotteeValid: (valid) => set({ isAllotteeValid: valid }),
}));
 
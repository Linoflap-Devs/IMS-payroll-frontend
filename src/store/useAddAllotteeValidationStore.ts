import { create } from "zustand";

interface AddAllotteeValidationState {
  validationAdd: boolean;
  setValidationAdd: (value: boolean) => void;
}

export const useAddAllotteeValidationStore = create<AddAllotteeValidationState>((set) => ({
  validationAdd: false,
  setValidationAdd: (value: boolean) => set({ validationAdd: value }),
}));

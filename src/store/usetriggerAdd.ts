import { create } from "zustand";

// Store for handling Add and Edit triggers
interface AllotteeTriggerStore {
  triggerAdd: boolean;
  triggerEdit: boolean; // new trigger for edit submission
  setTriggerAdd: (value: boolean) => void;
  setTriggerEdit: (value: boolean) => void;
}

export const useAllotteeTriggerStore = create<AllotteeTriggerStore>((set) => ({
  triggerAdd: false,
  triggerEdit: false,
  setTriggerAdd: (value) => set({ triggerAdd: value }),
  setTriggerEdit: (value) => set({ triggerEdit: value }),
}));

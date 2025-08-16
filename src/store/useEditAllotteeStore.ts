import { create } from 'zustand';

export interface DraftAllottee {
  [allotteeId: number]: Partial<{
    name: string;
    contactNumber: number;
    address: string;
    province: number;
    city: number;
    bank: number;
    branch: number;
    relationship: number;
    accountNumber: number;
    allotment: number;
  }>;
}

export const useEditAllotteeStore = create<{
  drafts: DraftAllottee;
  setDraft: (id: number, data: Partial<DraftAllottee[number]>) => void;
  clearDraft: (id: number) => void;
}>((set) => ({
  drafts: {},
  setDraft: (id, data) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [id]: { ...state.drafts[id], ...data }, // merge safely
      },
    })),
  clearDraft: (id) =>
    set((state) => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[id];
      return { drafts: newDrafts };
    }),
}));


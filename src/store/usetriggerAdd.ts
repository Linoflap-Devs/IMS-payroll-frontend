import { create } from "zustand";

export interface AllotteeUiModel {
  id: string;
  name: string;
  relationship: string;
  relationshipId: number;
  contactNumber: string;
  address: string;
  province: string;
  provinceId: string;
  city: string;
  cityId: string;
  bankName: string;
  bankId: string;
  bankBranch: string;
  branchId: string;
  accountNumber: string;
  allotment: number;
  priority: any;
  receivePayslip?: number;
  active: number;
  allotmentType: number;
  allotteeDetailID: string;
}

interface AllotteeTriggerStore {
  triggerAdd: boolean;
  triggerEdit: boolean;
  allotteesZustand: AllotteeUiModel[];
  savedAllotmentsType: AllotteeUiModel[];

  setTriggerAdd: (value: boolean) => void;
  setTriggerEdit: (value: boolean) => void;
  setAllotteesZustand: (value: AllotteeUiModel[]) => void;
  setSavedAllotmentsTypes: (
    value: AllotteeUiModel[] | ((prev: AllotteeUiModel[]) => AllotteeUiModel[])
  ) => void;}

export const useAllotteeTriggerStore = create<AllotteeTriggerStore>((set) => ({
  triggerAdd: false,
  triggerEdit: false,
  allotteesZustand: [],
  savedAllotmentsType: [], // initialized empty

  setTriggerAdd: (value) => set({ triggerAdd: value }),
  setTriggerEdit: (value) => set({ triggerEdit: value }),
  setAllotteesZustand: (value) => set({ allotteesZustand: value }),
  setSavedAllotmentsTypes: (value) =>
    set((state) => ({
      savedAllotmentsType:
        typeof value === "function"
          ? (value as (prev: AllotteeUiModel[]) => AllotteeUiModel[])(state.savedAllotmentsType)
          : value,
    })),
}));

import { create } from 'zustand';

type Bank = {
    BankID: string | number;
    BankName: string;
};

type BankBranch = {
    BankBranchId: string | number;
    BankBranchName: string;
    BankID: string | number;
};

interface BankState {

    banks: Bank[];
    branches: BankBranch[];
    selectedBankId: string | number | null;
    selectedBranchId: string | number | null;


    setBanks: (banks: Bank[]) => void;
    setBranches: (branches: BankBranch[]) => void;
    setSelectedBankId: (bankId: string | number | null) => void;
    setSelectedBranchId: (branchId: string | number | null) => void;


    getFilteredBranches: () => BankBranch[];
    getSelectedBank: () => Bank | undefined;
    getSelectedBranch: () => BankBranch | undefined;
}

export const useBankStore = create<BankState>((set, get) => ({

    banks: [],
    branches: [],
    selectedBankId: null,
    selectedBranchId: null,


    setBanks: (banks) => set({ banks }),
    setBranches: (branches) => set({ branches }),
    setSelectedBankId: (bankId) => set({
        selectedBankId: bankId,
        selectedBranchId: null
    }),
    setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),

    getFilteredBranches: () => {
        const { branches, selectedBankId } = get();
        if (selectedBankId === null) return [];
        return branches.filter(branch => branch.BankID === selectedBankId);
    },
    getSelectedBank: () => {
        const { banks, selectedBankId } = get();
        return banks.find(bank => bank.BankID === selectedBankId);
    },
    getSelectedBranch: () => {
        const { branches, selectedBranchId } = get();
        return branches.find(branch => branch.BankBranchId === selectedBranchId);
    }
}));
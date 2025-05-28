import { create } from 'zustand';
import { getBankList, BankItem } from '@/src/services/bank/bank.api';

interface BankState {
    isLoading: boolean;
    error: string | null;
    allBankData: BankItem[];
    selectedBankId: string | number | null;
    selectedBranchId: string | number | null;

    fetchBanks: () => Promise<void>;
    setSelectedBankId: (bankId: string | number | null) => void;
    setSelectedBranchId: (branchId: string | number | null) => void;

    getUniqueBanks: () => { BankID: string | number; BankName: string }[];
    getBranchesForSelectedBank: () => { BankBranchID: string | number; BankBranchName: string }[];
}

export const useBankStore = create<BankState>((set, get) => ({
    isLoading: false,
    error: null,
    allBankData: [],
    selectedBankId: null,
    selectedBranchId: null,

    fetchBanks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await getBankList();
            if (response.success) {
                set({ allBankData: response.data, isLoading: false });
            } else {
                set({ error: response.message || 'Failed to fetch bank data', isLoading: false });
            }
        } catch (error) {
            set({ error: 'An error occurred while fetching bank data', isLoading: false });
            console.error('Error fetching bank data:', error);
        }
    },

    setSelectedBankId: (bankId) => {
        set({
            selectedBankId: bankId,
            selectedBranchId: null
        });
    },

    setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),

    getUniqueBanks: () => {
        const { allBankData } = get();
        const bankMap = new Map();

        allBankData.forEach(item => {
            if (!bankMap.has(item.BankID)) {
                bankMap.set(item.BankID, {
                    BankID: item.BankID,
                    BankName: item.BankName
                });
            }
        });

        return Array.from(bankMap.values());
    },

    getBranchesForSelectedBank: () => {
        const { allBankData, selectedBankId } = get();
        if (!selectedBankId) return [];

        // Important fix: Convert both to the same type for comparison
        const branchMap = new Map();

        allBankData
            .filter(item => String(item.BankID) === String(selectedBankId))
            .forEach(item => {
                if (!branchMap.has(item.BankBranchID)) {
                    branchMap.set(item.BankBranchID, {
                        BankBranchID: item.BankBranchID,
                        BankBranchName: item.BankBranchName
                    });
                }
            });

        const result = Array.from(branchMap.values());
        return result;
    }
}));
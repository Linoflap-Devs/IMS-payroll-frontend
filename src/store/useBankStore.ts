import { create } from 'zustand';
import { getBankList, BankItem } from '@/src/services/bank/bank.api';

interface BankState {
    isLoading: boolean;
    error: string | null;
    allBankData: BankItem[];
    selectedBankId: number | null;
    selectedBranchId: number | null;

    fetchBanks: () => Promise<void>;
    setSelectedBankId: (bankId: number | null) => void;
    setSelectedBranchId: (branchId: number | null) => void;

    getUniqueBanks: () => { BankID: number; BankName: string; }[];
    getBranchesByBankId: (bankId: number) => { BankID: number; BankBranchID: number; BankBranchName: string }[];
    getBranchesForSelectedBank: () => { BankID: number; BankBranchID: number; BankBranchName: string }[];
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
            selectedBranchId: null // Reset branch when bank changes
        });
    },

    setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),

    // Fixed: Get unique banks (removed BranchID/BranchName from bank objects)
    getUniqueBanks: () => {
        const { allBankData } = get();
        const bankMap = new Map<number, { BankID: number; BankName: string; }>();

        allBankData.forEach(item => {
            const bankId = Number(item.BankID);
            if (!bankMap.has(bankId)) {
                bankMap.set(bankId, {
                    BankID: bankId,
                    BankName: item.BankName,
                });
            }
        });

        return Array.from(bankMap.values());
    },

    // Fixed: Get branches for a specific bank ID
    getBranchesByBankId: (bankId: number) => {
        const { allBankData } = get();
        if (!bankId) return [];

        const branchMap = new Map<number, {
            BankID: number;
            BankBranchID: number;
            BankBranchName: string;
        }>();

        allBankData
            .filter((item) => Number(item.BankID) === Number(bankId))
            .forEach((item) => {
                const branchId = Number(item.BankBranchID);
                if (!branchMap.has(branchId)) {
                    branchMap.set(branchId, {
                        BankID: Number(item.BankID),
                        BankBranchID: branchId,
                        BankBranchName: item.BankBranchName,
                    });
                }
            });

        return Array.from(branchMap.values());
    },

    // Fixed: Get branches for the currently selected bank
    getBranchesForSelectedBank: () => {
        const { selectedBankId, getBranchesByBankId } = get();
        if (!selectedBankId) return [];
        return getBranchesByBankId(selectedBankId);
    },
}));
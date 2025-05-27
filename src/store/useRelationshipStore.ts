import { create } from 'zustand';
import { getRelationshipList, IRelationship } from '../services/relationship/relationship.api';

interface IRelationshipState {
    isLoading: boolean;
    error: string | null;
    allRelationshipData: IRelationship[];

    fetchRelationships: () => Promise<void>;
}

export const useRelationshipStore = create<IRelationshipState>((set) => ({
    isLoading: false,
    error: null,
    allRelationshipData: [],

    fetchRelationships: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await getRelationshipList();
            if (response.success) {
                set({ allRelationshipData: response.data, isLoading: false });
                console.log('Loaded relationship data:', response.data); // Debug log
            } else {
                set({ error: response.message || 'Failed to fetch relationship data', isLoading: false })
            }
        } catch (error) {
            set({ error: 'An error occurred while fetching relationship data', isLoading: false });
            console.error('Error fetching relationship data:', error);
        }
    }
}))

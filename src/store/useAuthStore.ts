import { create } from 'zustand';

type User = {
  Email: string;
  UserType: number;
  FirstName?: string;
  LastName?: string;
  UserTypeName?: string;
};

type AuthState = {
  user: User | null;
  isUserValid: boolean;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (value: boolean) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isUserValid: false,
  loading: true,
  initialized: false,

  setUser: (user) =>
    set({
      user,
      isUserValid: true,
      loading: false,
      initialized: true,
    }),

  logout: () =>
    set({
      user: null,
      isUserValid: false,
      loading: false,
      initialized: true,
    }),

  setLoading: (loading) => set({ loading }),

  setInitialized: (value) => set({ initialized: value }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'kiki-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


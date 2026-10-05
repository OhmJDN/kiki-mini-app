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
        try {
          localStorage.removeItem('kiki-auth-storage');
        } catch {}
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'kiki-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Automatically purge stale demo profile so real LINE profile is fetched!
        if (state?.user?.display_name?.includes('มินตรา') || state?.user?.line_user_id === 'demo_customer_line_id') {
          state.user = null;
          state.isAuthenticated = false;
          try {
            localStorage.removeItem('kiki-auth-storage');
          } catch {}
        }
      },
    }
  )
);


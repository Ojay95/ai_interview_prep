
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Robust environment access
// @ts-ignore
const env = window.process?.env || {};
const IS_DEMO_MODE = env.VITE_DEMO_MODE === 'true';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          if (IS_DEMO_MODE) {
            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock Login Logic
            const mockUser: User = {
              id: '1',
              email: email,
              name: email.split('@')[0] || 'Demo User',
              plan: email.includes('admin') ? 'elite' : 'free',
              avatar: `https://i.pravatar.cc/150?u=${email}`
            };
            
            set({ user: mockUser, token: 'mock-jwt-token-123', isLoading: false });
            toast.success(`Welcome back, ${mockUser.name}!`);
            return;
          }

          // Real Backend Call
          const response = await apiClient.post('/auth/login', { email, password });
          const { user, token } = response.data;
          
          set({ user, token, isLoading: false });
          toast.success('Successfully logged in');

        } catch (error) {
          set({ isLoading: false });
          if (!IS_DEMO_MODE) toast.error('Invalid credentials');
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth_token');
        toast.success('Logged out successfully');
      },

      updateUser: (updates) => {
        set((state) => {
            if (!state.user) return state;
            return { user: { ...state.user, ...updates } };
        });
      }
    }),
    {
      name: 'auth_storage', // Key in localStorage
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user/token
    }
  )
);

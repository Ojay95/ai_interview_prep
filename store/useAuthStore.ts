
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
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  bypassAuth: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Access the polyfilled environment safely
const IS_DEMO_MODE = typeof process !== 'undefined' && process.env?.VITE_DEMO_MODE === 'true';

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
            await new Promise(resolve => setTimeout(resolve, 800));
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

          const response = await apiClient.post('/auth/login', { email, password });
          const { user: rawUser, token } = response.data;
          const userObj: User = {
            id: rawUser.id,
            email: rawUser.email,
            name: `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim() || rawUser.email.split('@')[0],
            plan: (rawUser.plan || 'free').toLowerCase() as 'free' | 'pro' | 'elite',
            avatar: `https://i.pravatar.cc/150?u=${rawUser.email}`
          };
          localStorage.setItem('auth_token', token);
          set({ user: userObj, token, isLoading: false });
          toast.success(`Welcome back, ${userObj.name}!`);
        } catch (error) {
          set({ isLoading: false });
          if (!IS_DEMO_MODE) toast.error('Invalid credentials');
          throw error;
        }
      },

      register: async (firstName, lastName, email, password) => {
        set({ isLoading: true });
        try {
          if (IS_DEMO_MODE) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockUser: User = {
              id: '1',
              email: email,
              name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
              plan: 'free',
              avatar: `https://i.pravatar.cc/150?u=${email}`
            };
            set({ user: mockUser, token: 'mock-jwt-token-123', isLoading: false });
            toast.success(`Welcome, ${mockUser.name}!`);
            return;
          }

          const response = await apiClient.post('/auth/register', { firstName, lastName, email, password });
          const { user: rawUser, token } = response.data;
          const userObj: User = {
            id: rawUser.id,
            email: rawUser.email,
            name: `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim() || rawUser.email.split('@')[0],
            plan: (rawUser.plan || 'free').toLowerCase() as 'free' | 'pro' | 'elite',
            avatar: `https://i.pravatar.cc/150?u=${rawUser.email}`
          };
          localStorage.setItem('auth_token', token);
          set({ user: userObj, token, isLoading: false });
          toast.success(`Successfully registered! Welcome, ${userObj.name}`);
        } catch (error: any) {
          set({ isLoading: false });
          const errMsg = error.response?.data?.message || 'Registration failed';
          toast.error(errMsg);
          throw error;
        }
      },

      bypassAuth: () => {
        const mockUser: User = {
          id: 'practice-user',
          email: 'practice@mockinterview.ai',
          name: 'Practice Mode',
          plan: 'elite',
          avatar: 'https://i.pravatar.cc/150?u=practice'
        };
        set({ user: mockUser, token: 'practice-token', isLoading: false });
        toast.success('Entering Practice Mode');
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
      name: 'auth_storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

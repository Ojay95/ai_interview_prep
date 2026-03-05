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

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    // 1. Call your Spring Boot AuthController
                    const response = await apiClient.post('/auth/login', { email, password });

                    // 2. Extract the token and user details from the Java backend response
                    const { token, user } = response.data;

                    // 🚨 CRITICAL FIX: Save token to localStorage so apiClient.ts interceptor can find it!
                    localStorage.setItem('auth_token', token);

                    // 3. Update Zustand state
                    set({ user, token, isLoading: false });
                    toast.success('Successfully logged in!');

                } catch (error: any) {
                    set({ isLoading: false });
                    console.error("Login error:", error);
                    // Show the actual error message from Spring Boot if available, otherwise generic
                    toast.error(error.response?.data?.message || 'Invalid email or password');
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null });
                // 🚨 CRITICAL FIX: Remove the token from localStorage on logout
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
            // Only persist user and token, don't persist isLoading state
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
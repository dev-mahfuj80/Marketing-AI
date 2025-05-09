import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Types
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  facebookToken: string | null;
  facebookTokenExpiry: string | null;
  linkedInToken: string | null;
  linkedInTokenExpiry: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
};

// API base URL - this should come from env variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(
            `${API_URL}/api/auth/login`,
            { email, password },
            { withCredentials: true } // Important for cookies
          );
          
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const err = error as Error & { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Register action
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(
            `${API_URL}/api/auth/register`,
            { name, email, password },
            { withCredentials: true }
          );
          
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const err = error as Error & { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Logout action
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          await axios.post(
            `${API_URL}/api/auth/logout`,
            {},
            { withCredentials: true }
          );
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const err = error as Error & { response?: { data?: { message?: string } } };
          set({
            error: err.response?.data?.message || 'Logout failed',
            isLoading: false,
          });
        }
      },

      // Fetch current user
      fetchUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.get(
            `${API_URL}/api/auth/me`,
            { withCredentials: true }
          );
          
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const err = error as Error & { response?: { data?: { message?: string }, status?: number } };
          // Only set error if it's not a 401 (unauthorized)
          if (err.response?.status !== 401) {
            set({
              error: err.response?.data?.message || 'Failed to fetch user',
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },

      // Update user information
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
      
      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

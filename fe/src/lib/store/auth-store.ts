// Using JSDoc comments instead of @ts-nocheck to fix type issues
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {Object} connections - Social connections
 * @property {boolean} connections.facebook - Facebook connection status
 * @property {boolean} connections.linkedin - LinkedIn connection status
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user
 * @property {boolean} isAuthenticated - Authentication status
 * @property {boolean} isLoading - Loading status
 * @property {string|null} error - Error message
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api";
import { AxiosError } from "axios";

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  connections: {
    facebook: boolean;
    linkedin: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  connectFacebook: () => Promise<void>;
  connectLinkedin: () => Promise<void>;
  resetError: () => void;
}

// Create auth store with simple implementation
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login function
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login(email, password);

          console.log("Storing user data in auth store:", response.data.user);

          // Store the user data from the response
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Register function
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(name, email, password);
          set({ isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Registration failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Logout function
      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          // Clear the auth token cookie by setting it to expire in the past
          document.cookie =
            "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear any persisted state
          localStorage.removeItem("auth-storage");
          sessionStorage.clear();

          // Force a reload to ensure all state is cleared
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }

          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Logout failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          console.error("Logout error:", error);
          return false;
        }
      },

      // Check if user is authenticated
      checkAuthStatus: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.checkStatus();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Authentication failed";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Connect Facebook
      connectFacebook: async () => {
        try {
          set({ isLoading: true, error: null });
          // In a real implementation, call the API to connect Facebook
          await authApi.getConnections();

          // For now, mock a successful connection
          set((state: AuthState) => ({
            user: state.user
              ? {
                  ...state.user,
                  connections: {
                    ...state.user.connections,
                    facebook: true,
                  },
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Facebook connection failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Connect LinkedIn
      connectLinkedin: async () => {
        try {
          set({ isLoading: true, error: null });
          // In a real implementation, call the API to connect LinkedIn
          await authApi.getConnections();

          // For now, mock a successful connection
          set((state: AuthState) => ({
            user: state.user
              ? {
                  ...state.user,
                  connections: {
                    ...state.user.connections,
                    linkedin: true,
                  },
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "LinkedIn connection failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Reset error
      resetError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      // Only store non-function values
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

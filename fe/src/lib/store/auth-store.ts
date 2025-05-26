import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api";
import { AxiosError } from "axios";

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
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

      // Social connections have been removed
      // Now using direct API key approach for social media interactions

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

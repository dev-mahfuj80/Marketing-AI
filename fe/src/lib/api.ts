import axios from "axios";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Important for handling cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    // Direct API call to the exact endpoint you're trying to reach
    console.log('Attempting login with:', { email });
    
    try {
      // Based on your error message, try this endpoint directly
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Login response:', response);
      
      // Manually set the auth token cookie if it's not being set by the server
      if (response.data.accessToken) {
        document.cookie = `auth_token=${response.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    return api.post("/auth/register", { name, email, password });
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  me: async () => {
    return api.get("/auth/me");
  },

  checkStatus: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getConnections: async () => {
    return api.get("/auth/connections");
  },

  forgotPassword: async (email: string) => {
    return api.post("/auth/request-password-reset", { email });
  },

  resetPassword: async (token: string, password: string) => {
    return api.post("/auth/reset-password", { token, password });
  },
};

// Social Media Posts API calls
export const postsApi = {
  getFacebookPosts: async () => {
    return api.get("/posts/facebook");
  },

  getLinkedinPosts: async () => {
    return api.get("/posts/linkedin");
  },

  createPost: async (formData: FormData) => {
    return api.post("/posts/publish", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;

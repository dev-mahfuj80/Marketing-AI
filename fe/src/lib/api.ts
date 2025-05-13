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
    return api.post("/api/auth/register", { name, email, password });
  },

  logout: async () => {
    return api.post("/api/auth/logout");
  },

  me: async () => {
    return api.get("/api/auth/me");
  },

  checkStatus: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  getConnections: async () => {
    return api.get("/api/auth/connections");
  },

  forgotPassword: async (email: string) => {
    try {
      console.log('Sending password reset request for email:', email);
      
      // Try the first endpoint format
      try {
        const response = await api.post("/api/auth/forgot-password", { email });
        console.log('Password reset response:', response);
        return response;
      } catch (innerError) {
        console.log('First endpoint failed, trying alternative endpoint', innerError);
        // If first endpoint fails, try the second format
        const response = await api.post("/api/auth/request-password-reset", { email });
        console.log('Password reset response from alternative endpoint:', response);
        return response;
      }
    } catch (error) {
      console.error('Both password reset request endpoints failed:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      return await api.post("/api/auth/reset-password", { token, password });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },
};

// Social Media Posts API calls
export const postsApi = {
  getFacebookPosts: async () => {
    return api.get("/api/posts/facebook");
  },

  getLinkedinPosts: async () => {
    return api.get("/api/posts/linkedin");
  },

  createPost: async (formData: FormData) => {
    return api.post("/api/posts/publish", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;

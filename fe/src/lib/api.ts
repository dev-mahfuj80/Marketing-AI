import axios from "axios";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for handling cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    console.log("Attempting login with:", { email });

    try {
      const response = await api.post("/api/auth/login", { email, password });

      console.log("Login response:", response);

      // Manually set the auth token cookie if it's not being set by the server
      if (response.data.accessToken) {
        document.cookie = `auth_token=${response.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
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
      console.log("Sending password reset request for email:", email);

      // Try the first endpoint format
      try {
        const response = await api.post("/api/auth/forgot-password", { email });
        console.log("Password reset response:", response);
        return response;
      } catch (innerError) {
        console.log(
          "First endpoint failed, trying alternative endpoint",
          innerError
        );
        // If first endpoint fails, try the second format
        const response = await api.post("/api/auth/request-password-reset", {
          email,
        });
        console.log(
          "Password reset response from alternative endpoint:",
          response
        );
        return response;
      }
    } catch (error) {
      console.error("Both password reset request endpoints failed:", error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      return await api.post("/api/auth/reset-password", { token, password });
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  },

  // Social login functions (Facebook removed - using API key directly)

  initiateOAuthLinkedIn: async () => {
    try {
      const response = await api.get("/api/auth/linkedin");
      return response.data;
    } catch (error) {
      console.error("Failed to initiate LinkedIn OAuth:", error);
      throw error;
    }
  },

  disconnectSocialAccount: async (platform: "linkedin") => {
    try {
      const response = await api.delete(`/api/social/${platform}/disconnect`);
      return response.data;
    } catch (error) {
      console.error(`Failed to disconnect ${platform} account:`, error);
      throw error;
    }
  },

  // Social login for sign-in page

  loginWithLinkedIn: async () => {
    // Use the API route as the callback URL for LinkedIn
    const callbackUrl = `${window.location.origin}/api/auth/callback`;
    console.log('Initiating LinkedIn login with callback URL:', callbackUrl);
    
    // Encode the final destination URL where LinkedIn should redirect after auth
    const finalRedirect = encodeURIComponent(window.location.origin + '/dashboard');
    
    const linkedInAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/linkedin?redirect_uri=${encodeURIComponent(callbackUrl)}&state=${finalRedirect}`;
    console.log('Redirecting to LinkedIn auth URL:', linkedInAuthUrl);
    window.location.href = linkedInAuthUrl;
  },
};

// Social Media Posts API calls
export const postsApi = {
  getFacebookPosts: async (pageId: string = "me") => {
    // Using the new endpoint format that works with FACEBOOK_PAGE_ACCESS_TOKEN from .env
    console.log(`Fetching Facebook posts for page ID: ${pageId}`);
    return api.get(`/api/facebook/pages/${pageId}/posts`);
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

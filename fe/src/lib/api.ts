import axios from "axios";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Important for handling cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the API configuration for debugging
console.log("API Configuration:", {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      if (response.data.accessToken) {
        document.cookie = `auth_token=${response.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    return api.post("/api/auth/register", { name, email, password });
  },

  logout: async () => {
    return api.post("/api/auth/logout");
  },

  getCurrentUser: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  forgotPassword: async (email: string) => {
    try {
      console.log("Sending password reset request for email:", email);

      // Try the first endpoint format
      try {
        const response = await api.post("/api/auth/forgot-password", { email });
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
};

// LinkedIn API specific calls
export const linkedinApi = {
  // Get LinkedIn user profile information - available even with limited permissions
  getLinkedInPageStatus: async () => {
    try {
      return await api.get("/api/social/linkedin/status");
    } catch (error) {
      console.error("Error getting LinkedIn profile info:", error);
      throw error;
    }
  },

  // Get LinkedIn posts directly from page using access token - no auth required
  getLinkedInPagePosts: async (start = 0, count = 10) => {
    try {
      return await api.get("/api/social/linkedin/page/posts", {
        params: { start, count },
      });
    } catch (error) {
      console.error("Error getting LinkedIn page posts:", error);
      throw error;
    }
  },
};

// Facebook API specific calls
export const facebookApi = {
  // Check Facebook connection status and permissions
  getFacebookPageStatus: async () => {
    try {
      return await api.get("/api/social/facebook/status");
    } catch (error) {
      console.error("Error getting Facebook page info:", error);
      throw error;
    }
  },

  getFacebookPosts: async (pageId: string = "me", start = 0, count = 10) => {
    try {
      const response = await api.get(
        `/api/social/facebook/pages/${pageId}/posts`,
        {
          params: { start, count },
        }
      );
      return response;
    } catch (error) {
      console.error("Error getting Facebook page posts:", error);
      throw error;
    }
  },
};

// Social Media Posts API calls
export const postsApi = {
  // Generic post creation function
  createPost: async (formData: FormData) => {
    try {
      return await api.post("/api/social/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },
};

// LangChain API calls
export const langChainApi = {
  // Generic post creation function
  getLangChainResponse: async (content: string) => {
    try {
      // send with authentication
      return await api.post(
        "/api/lang-chain",
        { content },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error getting LangChain response:", error);
      throw error;
    }
  },
};

export default api;

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

  // Social media API functionality
  // Note: OAuth login functionality has been removed
  // Now using direct API keys from environment variables
};

// Social Media Posts API calls
export const postsApi = {
  getFacebookPosts: async (pageId: string = "me") => {
    // Using the new endpoint format that works with FACEBOOK_PAGE_ACCESS_TOKEN from .env
    console.log(`Fetching Facebook posts for page ID: ${pageId}`);
    return api.get(`/api/facebook/pages/${pageId}/posts`);
  },

  createFacebookPost: async (content: string, image?: File, pageId: string = "me") => {
    console.log(`Creating Facebook post for page ID: ${pageId}`);
    
    // If we have an image, we need to use FormData
    if (image) {
      const formData = new FormData();
      formData.append('message', content);
      formData.append('image', image);
      
      return api.post(`/api/facebook/pages/${pageId}/publish`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // No image, just send a regular JSON request
      return api.post(`/api/facebook/pages/${pageId}/publish`, { message: content });
    }
  },

  getLinkedinPosts: async () => {
    return api.get("/api/linkedin/posts");
  },
  
  createLinkedinPost: async (content: string, imageUrl?: string) => {
    return api.post("/api/linkedin/posts", { content, imageUrl });
  },

  // Generic post creation function
  createPost: async (formData: FormData) => {
    // Extract data from formData to determine which platform to post to
    const content = formData.get('content') as string;
    const platform = formData.get('platform') as string;
    const image = formData.get('image') as File | null;
    
    console.log('Creating post with platform:', platform, 'has image:', !!image);
    
    // If a specific platform is specified, use the dedicated endpoint
    if (platform === 'facebook') {
      // For Facebook, pass the actual File object, not a URL
      return postsApi.createFacebookPost(content, image || undefined);
    } else if (platform === 'linkedin') {
      // For LinkedIn, pass the actual content and image
      return postsApi.createLinkedinPost(content, image ? URL.createObjectURL(image) : undefined);
    }
    
    // If no platform specified or other platform, use the generic endpoint
    console.warn('Using generic post endpoint');
    return api.post("/api/posts/publish", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { facebookApi, linkedinApi } from "../api";

interface FacebookPost {
  id: string;
  created_time: string;
  message: string;
  attachments: {
    data: {
      media: {
        image: {
          height: number;
          src: string;
          width: number;
        };
      };
      target: {
        id: string;
        url: string;
      };
      title: string;
      type: string;
      url: string;
    }[];
  };
  permalink_url: string;
  full_picture: string;
  picture: string;
}

interface LinkedInPost {
  owner: string;
  activity: string;
  edited: boolean;
  created: {
    actor: string;
    time: number;
  };
  text: {
    annotations: unknown[];
    text: string;
  };
  lastModified: {
    actor: string;
    time: number;
  };
  id: string;
  distribution?: {
    linkedInDistributionTarget: {
      visibleToGuest: boolean;
    };
  };
  content?: {
    contentEntities: Array<{
      description: string;
      entityLocation?: string;
      thumbnails?: Array<{
        imageSpecificContent: {
          width: number;
          height: number;
        };
        resolvedUrl: string;
      }>;
      entity: string;
    }>;
    description?: string;
    shareMediaCategory?: string;
  };
}
interface SocialState {
  // states
  loading: boolean;
  error: string | null;
  facebookPosts: FacebookPost[];
  linkedinPosts: LinkedInPost[];
  connectionStatus: {
    facebook: boolean;
    linkedin: boolean;
  };
  linkedinProfile: {
    id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
    // Add other profile fields as needed
  };
  facebookProfile: {
    id?: string;
    name?: string;
    email?: string;
    picture?: {
      data?: {
        url?: string;
      };
    };
    // Add other profile fields as needed
  };

  // functions
  getFacebookPosts: (
    pageId: string,
    start: number,
    count: number
  ) => Promise<void>;
  getLinkedInPosts: (start: number, count: number) => Promise<void>;
  getFacebookProfile: (pageId: string) => Promise<void>;
  getLinkedInProfile: (pageId: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      // states
      loading: false,
      error: null,
      facebookPosts: [],
      linkedinPosts: [],
      connectionStatus: {
        facebook: false,
        linkedin: false,
      },
      linkedinProfile: {},
      facebookProfile: {},

      // functions
      getFacebookPosts: async (pageId = "me", start = 0, count = 10) => {
        set({ loading: true });
        try {
          const response = await facebookApi.getFacebookPosts(
            pageId,
            Number(start),
            Number(count)
          );
          const data = await response.data;
          set({ facebookPosts: data.posts || [] });
        } catch (error) {
          console.error("Error fetching Facebook posts:", error);
          set({ error: "Failed to fetch Facebook posts" });
        } finally {
          set({ loading: false });
        }
      },

      getLinkedInPosts: async (start = 0, count = 10) => {
        set({ loading: true });
        try {
          const response = await linkedinApi.getPagePosts(start, count);
          const data = await response.data;
          set({ linkedinPosts: data.posts || [] });
        } catch (error) {
          console.error("Error fetching LinkedIn posts:", error);
          set({ error: "Failed to fetch LinkedIn posts" });
        } finally {
          set({ loading: false });
        }
      },

      checkConnectionStatus: () => {
        // Implement connection status check
      },

      getLinkedInProfile: async () => {
        // Implement LinkedIn profile fetching
      },

      getFacebookProfile: async () => {
        // Implement Facebook profile fetching
      },
    }),
    {
      name: "social-storage",
      storage: createJSONStorage(() => sessionStorage), // or localStorage
    }
  )
);

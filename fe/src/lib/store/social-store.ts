import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { facebookApi, linkedinApi } from "../api";
// import from posts.d.ts file
import { SocialState } from "../../types/social-store";

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

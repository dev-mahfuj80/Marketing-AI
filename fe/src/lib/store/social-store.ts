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
      linkedinProfile: {
        connected: false,
        credentialsValid: false,
        profileInfo: undefined
      },
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
          const response = await linkedinApi.getLinkedInPagePosts(start, count);
          const data = await response.data;
          set({ linkedinPosts: data.posts || [] });
        } catch (error) {
          console.error("Error fetching LinkedIn posts:", error);
          set({ error: "Failed to fetch LinkedIn posts" });
        } finally {
          set({ loading: false });
        }
      },

      getLinkedInProfileStatus: async () => {
        set({ loading: true });
        try {
          const response = await linkedinApi.getLinkedInProfileStatus();
          const data = await response.data;
          set({ linkedinProfile: data });
        } catch (error) {
          console.error("Error fetching LinkedIn profile:", error);
          set({ error: "Failed to fetch LinkedIn profile" });
        } finally {
          set({ loading: false });
        }
      },

      getFacebookProfileStatus: async () => {
        set({ loading: true });
        try {
          const response = await facebookApi.getFacebookProfileStatus();
          const data = await response.data;
          set({ facebookProfile: data });
        } catch (error) {
          console.error("Error fetching Facebook profile:", error);
          set({ error: "Failed to fetch Facebook profile" });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "social-storage",
      storage: createJSONStorage(() => sessionStorage), // or localStorage
    }
  )
);

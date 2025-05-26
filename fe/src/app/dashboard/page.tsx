"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { Linkedin, Facebook, Loader2 } from "lucide-react";
import { useSocialStore } from "@/lib/store/social-store";

// Define post interfaces
// Define API error interface for better type safety
interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      limitedPermissions?: boolean;
    };
  };
  message?: string;
}

interface Post {
  id: string;
  content?: string;
  platform: "facebook" | "linkedin";
  createdAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  imageUrl?: string | null;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string | null;
  picture?: string | null;

  // LinkedIn specific fields
  platformId?: string | number | null;
  publishedAt?: number;
  mediaUrl?: string | null;
  engagement?: {
    impressions: number;
    reactions: number;
  };
}

export default function DashboardPage() {
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("facebook");

  const { getFacebookPosts, getLinkedInPosts } = useSocialStore();

  // functions
  const fetchFacebookPosts = useCallback(async () => {
    setIsFacebookLoading(true);
    try {
      await getFacebookPosts("me", 0, 10); // Now this will work
    } catch (error) {
      console.error("Error fetching Facebook posts:", error);
    } finally {
      setIsFacebookLoading(false);
    }
  }, [getFacebookPosts]);
  // use callback function to get linkedin posts
  const fetchLinkedInPosts = useCallback(async () => {
    setIsLinkedInLoading(true);
    try {
      await getLinkedInPosts(0, 10);
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
    } finally {
      setIsLinkedInLoading(false);
    }
  }, [getLinkedInPosts]);

  useEffect(() => {
    if (activeTab === "facebook") {
      fetchFacebookPosts();
    } else if (activeTab === "linkedin") {
      fetchLinkedInPosts();
    }
  }, [activeTab]);

  return (
    <div className="space-y-8">
      <Tabs
        defaultValue="facebook"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>

          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>
        {isFacebookLoading || isLinkedInLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="facebook">
            {/* <FacebookPostsContainer
              platform="facebook"
              posts={facebookPosts}
              isLoading={isFacebookLoading}
              onRefresh={fetchFacebookPosts}
              emptyMessage="No Facebook posts found"
            /> */}
            <div>Hello</div>
          </TabsContent>
        )}
        {isLinkedInLoading || isLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="linkedin">
            {/* <LinkedInPostsContainer
              posts={linkedinPosts}
              isLoading={isLinkedInLoading}
              onRefresh={fetchLinkedInPosts}
              emptyMessage="No LinkedIn posts found"
            /> */}
            <div>Hello</div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

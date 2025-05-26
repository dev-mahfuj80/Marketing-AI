"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useCallback } from "react";
import { postsApi, linkedinApi, facebookApi } from "@/lib/api";
import { FacebookPostsContainer } from "@/components/posts/facebook-posts-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Linkedin, Facebook, Loader2 } from "lucide-react";
import { LinkedInPostsContainer } from "@/components/posts/linkedin-posts-container";

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
  const searchParams = useSearchParams();
  const [facebookPosts, setFacebookPosts] = useState<Post[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFacebookLoading, setIsFacebookLoading] = useState(true);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("facebook");
  const [connectionStatus, setConnectionStatus] = useState({
    facebook: false,
    linkedin: false,
  });

  // Store LinkedIn profile info if posts can't be accessed
  const [linkedinProfile, setLinkedinProfile] = useState<{
    name?: string;
    email?: string;
    profileImage?: string;
  }>({});
  console.log(linkedinProfile);
  // Facebook posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  const fetchFacebookPosts = useCallback(async () => {
    setIsFacebookLoading(true);
    try {
      // Get Facebook posts using the direct page token from backend
      const fbResponse = await postsApi.getFacebookPosts();

      // Check if the response has posts in the expected format
      let posts: Post[] = [];

      if (fbResponse.data.posts) {
        posts = fbResponse.data.posts || [];
      } else if (fbResponse.data.data) {
        // Handle old response format
        posts = fbResponse.data.data || [];
      } else {
        // If neither format is present, use the raw data
        posts = Array.isArray(fbResponse.data) ? fbResponse.data : [];
      }
      // Process posts to ensure image fields are properly handled
      const processedPosts = posts.map((post) => {
        return {
          ...post,
          // Ensure we have at least one image field populated
          imageUrl: post.imageUrl || post.full_picture || post.picture || null,
        };
      });

      setFacebookPosts(processedPosts);
      setConnectionStatus((prev) => ({ ...prev, facebook: true }));
    } catch (error) {
      const fbError = error as ApiError;
      console.error("Error fetching Facebook posts:", fbError);
      setFacebookPosts([]);
      setConnectionStatus((prev) => ({
        ...prev,
        facebook: false,
      }));
    } finally {
      setIsFacebookLoading(false);
    }
  }, []);

  // Function to fetch LinkedIn profile information when posts can't be accessed
  const fetchLinkedInProfile = useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const response = await linkedinApi.getProfileInfo();

      // Store the profile info, displaying LinkedIn User name when available
      setLinkedinProfile({
        name:
          response.data.name ||
          (response.data.firstName && response.data.lastName
            ? `${response.data.firstName} ${response.data.lastName}`
            : "LinkedIn User"),
        email: response.data.email || "Not available",
        profileImage: response.data.profilePicture || undefined,
      });

      // Mark as connected with limited permissions if applicable
      if (response.data.limited) {
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: true,
          linkedinLimitedPermissions: true,
        }));
      }
    } catch (error) {
      console.error("Error fetching LinkedIn profile:", error);

      // Set a default name even if there's an error
      setLinkedinProfile((prev) => ({
        ...prev,
        name: "LinkedIn User",
      }));
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // LinkedIn posts fetching function wrapped in useCallback
  const fetchLinkedInPosts = useCallback(async () => {
    setIsLinkedInLoading(true);
    try {
      const response = await linkedinApi.getPagePosts();
      setLinkedinPosts(response.data.posts || []);
      setConnectionStatus((prev) => ({ ...prev, linkedin: true }));
      return;
    } catch (directError) {
      console.log(
        "Direct LinkedIn access token failed, trying OAuth method...",
        directError
      );
    } finally {
      setIsLinkedInLoading(false);
    }
  }, []);

  // Combined function to fetch all posts
  const fetchPosts = useCallback(() => {
    fetchFacebookPosts();
    fetchLinkedInPosts();
  }, [fetchFacebookPosts, fetchLinkedInPosts]);

  // Check connection status for both platforms
  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check Facebook connection status using our API service
      try {
        const fbResponse = await facebookApi.checkStatus();
        const fbData = fbResponse.data;

        setConnectionStatus((prev) => ({
          ...prev,
          facebook: fbData.connected || false,
        }));
      } catch (fbError) {
        console.error("Error checking Facebook connection:", fbError);
        setConnectionStatus((prev) => ({
          ...prev,
          facebook: false,
          facebookPermissionsError: true,
        }));
      }

      // Check LinkedIn connection status using our API service
      try {
        const liResponse = await linkedinApi.getProfileInfo();
        const liData = liResponse.data;

        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: liData.connected || false,
        }));
      } catch (liError) {
        console.error("Error checking LinkedIn connection:", liError);
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: false,
          linkedinPermissionsError: true,
        }));
      }
    } catch (error) {
      console.error("Error checking connections:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    checkConnectionStatus();
  }, [fetchPosts, checkConnectionStatus]);

  useEffect(() => {
    const errorType = searchParams.get("error_type");
    const errorMessage = searchParams.get("error_message");

    if (errorType === "linkedin_error" && errorMessage) {
      console.error("LinkedIn error:", errorMessage);
      setConnectionStatus((prev) => ({
        ...prev,
        linkedinPermissionsError: true,
      }));
    }

    if (errorType === "facebook_error" && errorMessage) {
      console.error("Facebook error:", errorMessage);
      setConnectionStatus((prev) => ({
        ...prev,
        facebookPermissionsError: true,
      }));
    }
  }, [searchParams]);
  console.log(linkedinPosts);
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
        {isFacebookLoading || isLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="facebook">
            {!connectionStatus.facebook ? (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-medium mb-4">
                  Facebook is not connected
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connect your Facebook account to view and manage your posts.
                </p>
                <Button asChild variant="outline" onClick={fetchFacebookPosts}>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Facebook className="h-4 w-4" />
                    Refetch Token
                  </div>
                </Button>
              </Card>
            ) : (
              <FacebookPostsContainer
                platform="facebook"
                posts={facebookPosts}
                isLoading={isFacebookLoading}
                onRefresh={fetchFacebookPosts}
                emptyMessage="No Facebook posts found"
              />
            )}
          </TabsContent>
        )}
        {isLinkedInLoading || isLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="linkedin">
            <LinkedInPostsContainer
              posts={linkedinPosts}
              isLoading={isLinkedInLoading}
              onRefresh={fetchLinkedInPosts}
              emptyMessage="No LinkedIn posts found"
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

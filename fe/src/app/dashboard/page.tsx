"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useCallback } from "react";
import { postsApi, linkedinApi, facebookApi } from "@/lib/api";
import { LinkedInPermissions } from "@/components/linkedin/LinkedInPermissions";
import { FacebookPermissions } from "@/components/facebook/FacebookPermissions";
import { PostsContainer } from "@/components/posts/PostsContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Linkedin, Facebook, Loader2 } from "lucide-react";

// Define post interfaces
// Define API error interface for better type safety
interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

interface Post {
  id: string;
  content?: string;
  platform?: "facebook" | "linkedin";
  createdAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  imageUrl?: string;

  // Facebook specific fields
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [facebookPosts, setFacebookPosts] = useState<Post[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFacebookLoading, setIsFacebookLoading] = useState(true);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("facebook");
  const [connectionStatus, setConnectionStatus] = useState({
    facebook: false,
    linkedin: false,
    facebookPermissionsError: false,
    linkedinPermissionsError: false,
    linkedinLimitedPermissions: false,
  });

  // Store LinkedIn profile info if posts can't be accessed
  const [linkedinProfile, setLinkedinProfile] = useState<{
    name?: string;
    email?: string;
    profileImage?: string;
  }>({});

  // Facebook posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  const fetchFacebookPosts = useCallback(async () => {
    setIsFacebookLoading(true);
    try {
      // Get Facebook posts using the direct page token from backend
      const fbResponse = await postsApi.getFacebookPosts();
      console.log("Facebook posts response:", fbResponse.data);
      setFacebookPosts(fbResponse.data.data || []);
      setConnectionStatus((prev) => ({ ...prev, facebook: true }));
    } catch (error) {
      const fbError = error as ApiError;
      console.error("Error fetching Facebook posts:", fbError);
      setFacebookPosts([]);
      setConnectionStatus((prev) => ({
        ...prev,
        facebook: false,
        facebookPermissionsError:
          fbError.message?.includes("permission") || 
          fbError.response?.data?.error?.includes("permission") || 
          false,
      }));
    } finally {
      setIsFacebookLoading(false);
    }
  }, [])

  // LinkedIn posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  // Function to fetch LinkedIn profile information when posts can't be accessed
  const fetchLinkedInProfile = useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const response = await linkedinApi.getProfileInfo();
      setLinkedinProfile(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Error fetching LinkedIn profile:", apiError);

      // Check if error is due to expired token
      if (apiError?.response?.status === 401 ||
          (apiError?.response?.data?.error && apiError.response.data.error.includes('token'))) {
        console.log('Token may be expired, attempting to refresh...');
        try {
          // Try to refresh the token
          await linkedinApi.refreshToken();
          // Try fetching profile again with renewed token
          const newResponse = await linkedinApi.getProfileInfo();
          setLinkedinProfile(newResponse.data);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Update connection status to show reconnection needed
          setConnectionStatus(prev => ({
            ...prev,
            linkedin: false,
            linkedinLimitedPermissions: false,
            linkedinPermissionsError: true
          }));
        }
      }
      setConnectionStatus((prev) => ({
        ...prev,
        linkedin: true,
        linkedinLimitedPermissions: true,
      }));
    } finally {
      setIsProfileLoading(false);
    }
  }, [])

  // LinkedIn posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  const fetchLinkedInPosts = useCallback(async () => {
    setIsLinkedInLoading(true);
    try {
      // Get LinkedIn posts using direct client credentials from backend
      const liResponse = await postsApi.getLinkedinPosts();
      console.log("LinkedIn posts response:", liResponse.data);

      // Check if the response has an error property indicating permissions issues
      if (
        liResponse.data.error &&
        typeof liResponse.data.error === "string" &&
        liResponse.data.error.includes("permission")
      ) {
        console.log(
          "LinkedIn permission error detected, trying to fetch profile info instead"
        );
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: true,
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: true,
        }));
        setLinkedinPosts([]);

        // If posts can't be accessed due to permissions, fetch the profile info instead
        fetchLinkedInProfile();
      } else {
        // Check the structure of the response and handle accordingly
        if (Array.isArray(liResponse.data)) {
          setLinkedinPosts(liResponse.data);
        } else if (
          liResponse.data.elements &&
          Array.isArray(liResponse.data.elements)
        ) {
          setLinkedinPosts(liResponse.data.elements);
        } else {
          // If data exists but not in expected format, try to map it
          const posts = liResponse.data.data || liResponse.data;
          if (Array.isArray(posts)) {
            setLinkedinPosts(posts);
          } else {
            setLinkedinPosts([]);
          }
        }
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: true,
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: false,
        }));
      }
    } catch (error) {
      const liError = error as ApiError;
      console.error("Error fetching LinkedIn posts:", liError);
      // Check if the error is specifically about permissions
      const errorMessage = liError.message || 
        (liError.response?.data?.error || 
        liError.response?.data?.message || 
        'Unknown error');
      if (
        errorMessage.includes("permission") ||
        errorMessage.includes("403") ||
        errorMessage.includes("scope")
      ) {
        console.log(
          "LinkedIn posts access error, trying to fetch profile instead"
        );
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: true,
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: true,
        }));

        // Try to get the profile info instead
        fetchLinkedInProfile();
      } else {
        // General connection error
        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: false,
          linkedinPermissionsError: true,
          linkedinLimitedPermissions: false,
        }));
      }
    } finally {
      setIsLinkedInLoading(false);
    }
  }, [fetchLinkedInProfile]);

  // This block was moved up

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
        console.log("Facebook connection data:", fbData);

        setConnectionStatus((prev) => ({
          ...prev,
          facebook: fbData.connected || false,
          facebookPermissionsError:
            (fbData.connected &&
              fbData.permissions?.some(
                (p: { status: string }) => p.status === "missing"
              )) ||
            false,
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
        const liResponse = await linkedinApi.checkStatus();
        const liData = liResponse.data;
        console.log("LinkedIn connection data:", liData);

        setConnectionStatus((prev) => ({
          ...prev,
          linkedin: liData.connected || false,
          linkedinPermissionsError:
            (liData.connected &&
              liData.permissions?.some(
                (p: { status: string }) => p.status === "missing"
              )) ||
            false,
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
  }, [])

  useEffect(() => {
    fetchPosts();
    checkConnectionStatus();
  }, [fetchPosts, checkConnectionStatus]);

  // Removed auto-tab switching logic to always show both tabs regardless of connection status

  // Check if there are error messages from redirects
  useEffect(() => {
    const errorType = searchParams.get("error");
    const errorMessage = searchParams.get("message");

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

  return (
    <div className="space-y-8">
      <Tabs
        defaultValue="facebook"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
          {/* Always show Facebook tab */}
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>

          {/* Always show LinkedIn tab */}
          <TabsTrigger value="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>
        {/* Facebook Content Tab */}
        {isFacebookLoading || isLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="facebook">
            {/* Show Facebook permissions error message inside the tab if needed */}
            {connectionStatus.facebookPermissionsError && (
              <div className="mb-4">
                <FacebookPermissions showCompact={true} />
              </div>
            )}

            {/* Show loading/error state if Facebook isn't connected */}
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
            ) : !connectionStatus.facebookPermissionsError ? (
              <PostsContainer
                platform="facebook"
                posts={facebookPosts}
                isLoading={isFacebookLoading}
                onRefresh={fetchFacebookPosts}
                emptyMessage="No Facebook posts found"
              />
            ) : null}
          </TabsContent>
        )}
        {/* LinkedIn Content Tab */}
        {isLinkedInLoading || isLoading ? (
          <div className="flex items-center justify-center h-[90vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : (
          <TabsContent value="linkedin">
            {/* Show LinkedIn permissions error message inside the tab if needed */}
            {connectionStatus.linkedinPermissionsError && (
              <div className="mb-4">
                <LinkedInPermissions showCompact={true} />
              </div>
            )}

            {/* Show different states based on LinkedIn connection status */}
            {!connectionStatus.linkedin ? (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-medium mb-4">
                  LinkedIn is not connected
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connect your LinkedIn account to view and manage your posts.
                </p>
                <Button 
                  onClick={async () => {
                    try {
                      setIsLinkedInLoading(true);
                      // Request a fresh auth URL and redirect to LinkedIn
                      const response = await linkedinApi.getAuthUrl();
                      if (response?.data?.authUrl) {
                        window.location.href = response.data.authUrl;
                      } else {
                        console.error("Failed to get LinkedIn auth URL");
                        setIsLinkedInLoading(false);
                      }
                    } catch (error) {
                      console.error("Error starting LinkedIn auth flow:", error);
                      setIsLinkedInLoading(false);
                    }
                  }} 
                  variant="outline"
                  disabled={isLinkedInLoading}
                >
                  {isLinkedInLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </>
                  )}
                </Button>
              </Card>
            ) : connectionStatus.linkedinLimitedPermissions ? (
              <PostsContainer
                platform="linkedin"
                posts={[]}
                isLoading={isProfileLoading}
                onRefresh={fetchLinkedInProfile}
                emptyMessage="LinkedIn profile information"
                limitedPermissions={true}
                profileInfo={linkedinProfile}
              />
            ) : !connectionStatus.linkedinPermissionsError ? (
              <PostsContainer
                platform="linkedin"
                posts={linkedinPosts}
                isLoading={isLinkedInLoading}
                onRefresh={fetchLinkedInPosts}
                emptyMessage="No LinkedIn posts found"
              />
            ) : null}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

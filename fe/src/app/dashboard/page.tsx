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
import { Linkedin, Facebook, ExternalLink, RotateCw } from "lucide-react";

// Define post interfaces
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
    linkedinLimitedPermissions: false
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
      console.log('Facebook posts response:', fbResponse.data);
      setFacebookPosts(fbResponse.data.data || []);
      setConnectionStatus(prev => ({ ...prev, facebook: true }));
    } catch (fbError) {
      console.error("Error fetching Facebook posts:", fbError);
      setConnectionStatus(prev => ({ 
        ...prev, 
        facebook: false,
        facebookPermissionsError: fbError instanceof Error && fbError.message.includes('permission') 
      }));
    } finally {
      setIsFacebookLoading(false);
    }
  }, []);

  // LinkedIn posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  // Function to fetch LinkedIn profile information when posts can't be accessed
  const fetchLinkedInProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const profileResponse = await linkedinApi.getProfileInfo();
      console.log('LinkedIn profile response:', profileResponse.data);
      
      setLinkedinProfile({
        name: profileResponse.data.name,
        email: profileResponse.data.email,
        profileImage: profileResponse.data.profileImage
      });
      
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      // Even if profile fetch fails, we still want to show limited permissions UI
      setConnectionStatus(prev => ({
        ...prev,
        linkedin: true,
        linkedinLimitedPermissions: true
      }));
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // LinkedIn posts fetching function wrapped in useCallback to prevent unnecessary re-renders
  const fetchLinkedInPosts = useCallback(async () => {
    setIsLinkedInLoading(true);
    try {
      // Get LinkedIn posts using direct client credentials from backend
      const liResponse = await postsApi.getLinkedinPosts();
      console.log('LinkedIn posts response:', liResponse.data);
      
      // Check if the response has an error property indicating permissions issues
      if (liResponse.data.error && typeof liResponse.data.error === 'string' && 
          liResponse.data.error.includes('permission')) {
        console.log('LinkedIn permission error detected, trying to fetch profile info instead');
        setConnectionStatus(prev => ({ 
          ...prev, 
          linkedin: true,
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: true
        }));
        setLinkedinPosts([]);
        
        // If posts can't be accessed due to permissions, fetch the profile info instead
        fetchLinkedInProfile();
      } else {
        // Check the structure of the response and handle accordingly
        if (Array.isArray(liResponse.data)) {
          setLinkedinPosts(liResponse.data);
        } else if (liResponse.data.elements && Array.isArray(liResponse.data.elements)) {
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
        setConnectionStatus(prev => ({ 
          ...prev, 
          linkedin: true, 
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: false 
        }));
      }
    } catch (liError) {
      console.error("Error fetching LinkedIn posts:", liError);
      // Check if the error is specifically about permissions
      const errorMessage = liError instanceof Error ? liError.message : String(liError);
      if (errorMessage.includes('permission') || 
          errorMessage.includes('403') || 
          errorMessage.includes('scope')) {
        console.log('LinkedIn posts access error, trying to fetch profile instead');
        setConnectionStatus(prev => ({ 
          ...prev, 
          linkedin: true,
          linkedinPermissionsError: false,
          linkedinLimitedPermissions: true
        }));
        
        // Try to get the profile info instead
        fetchLinkedInProfile();
      } else {
        // General connection error
        setConnectionStatus(prev => ({ 
          ...prev, 
          linkedin: false,
          linkedinPermissionsError: true,
          linkedinLimitedPermissions: false
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
        console.log('Facebook connection data:', fbData);
        
        setConnectionStatus(prev => ({ 
          ...prev, 
          facebook: fbData.connected || false,
          facebookPermissionsError: fbData.connected && fbData.permissions?.some((p: {status: string}) => p.status === 'missing') || false
        }));
      } catch (fbError) {
        console.error("Error checking Facebook connection:", fbError);
        setConnectionStatus(prev => ({ 
          ...prev, 
          facebook: false,
          facebookPermissionsError: true
        }));
      }
      
      // Check LinkedIn connection status using our API service
      try {
        const liResponse = await linkedinApi.checkStatus();
        const liData = liResponse.data;
        console.log('LinkedIn connection data:', liData);
        
        setConnectionStatus(prev => ({
          ...prev,
          linkedin: liData.connected || false,
          linkedinPermissionsError: liData.connected && liData.permissions?.some((p: {status: string}) => p.status === 'missing') || false
        }));
      } catch (liError) {
        console.error("Error checking LinkedIn connection:", liError);
        setConnectionStatus(prev => ({ 
          ...prev, 
          linkedin: false,
          linkedinPermissionsError: true
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

  // Removed auto-tab switching logic to always show both tabs regardless of connection status

  // Check if there are error messages from redirects
  useEffect(() => {
    const errorType = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    if (errorType === 'linkedin_error' && errorMessage) {
      console.error('LinkedIn error:', errorMessage);
      setConnectionStatus(prev => ({
        ...prev,
        linkedinPermissionsError: true
      }));
    }
    
    if (errorType === 'facebook_error' && errorMessage) {
      console.error('Facebook error:', errorMessage);
      setConnectionStatus(prev => ({
        ...prev,
        facebookPermissionsError: true
      }));
    }
  }, [searchParams]);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="facebook" value={activeTab} onValueChange={setActiveTab}>
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
              <h3 className="text-lg font-medium mb-4">Facebook is not connected</h3>
              <p className="text-muted-foreground mb-6">Connect your Facebook account to view and manage your posts.</p>
              <Button asChild variant="outline">
                <a href="/api/facebook/auth" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Connect Facebook
                </a>
              </Button>
            </Card>
          ) : (!connectionStatus.facebookPermissionsError ? (
            <PostsContainer
              platform="facebook"
              posts={facebookPosts}
              isLoading={isFacebookLoading}
              onRefresh={fetchFacebookPosts}
              emptyMessage="No Facebook posts found"
            />
          ) : null)}
        </TabsContent>
        
        {/* LinkedIn Content Tab */}
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
              <h3 className="text-lg font-medium mb-4">LinkedIn is not connected</h3>
              <p className="text-muted-foreground mb-6">Connect your LinkedIn account to view and manage your posts.</p>
              <Button asChild variant="outline">
                <a href="/api/linkedin/auth" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  Connect LinkedIn
                </a>
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
          ) : (!connectionStatus.linkedinPermissionsError ? (
            <PostsContainer
              platform="linkedin"
              posts={linkedinPosts}
              isLoading={isLinkedInLoading}
              onRefresh={fetchLinkedInPosts}
              emptyMessage="No LinkedIn posts found"
            />
          ) : null)}
        </TabsContent>
      </Tabs>
      
      {/* Show a message if no social media connections are available */}
      {!connectionStatus.facebook && !connectionStatus.linkedin && !isLoading && (
        <Card className="p-6 max-w-xl mx-auto">
          <div className="text-center py-6 flex flex-col items-center">
            <h3 className="text-xl font-medium mb-3">Social Media Connection Required</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              To view and publish social media posts, you need to connect at least one platform.
              Configure your social media integrations below or in settings.
            </p>
            
            <div className="grid gap-6 w-full max-w-md">
              {/* LinkedIn Connection Card */}
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 text-white p-2 rounded-full">
                    <Linkedin size={18} />
                  </div>
                  <h4 className="font-medium">Connect LinkedIn</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your LinkedIn account to post and view content directly from the dashboard.
                </p>
                <Button 
                  className="w-full" 
                  onClick={async () => {
                    try {
                      const authData = await linkedinApi.getAuthUrl();
                      if (authData.authUrl) {
                        window.location.href = authData.authUrl;
                      }
                    } catch (error) {
                      console.error("Error getting LinkedIn auth URL:", error);
                    }
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect LinkedIn
                </Button>
              </div>
              
              {/* Facebook Connection Card */}
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-800 text-white p-2 rounded-full">
                    <Facebook size={18} />
                  </div>
                  <h4 className="font-medium">Connect Facebook Page</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Facebook page to post and view content directly from the dashboard.
                </p>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/dashboard/settings?tab=facebook"}
                >
                  Configure Facebook
                </Button>
              </div>
              
              <div className="flex justify-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={checkConnectionStatus}
                  className="text-xs"
                >
                  <RotateCw className="mr-1 h-3 w-3" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

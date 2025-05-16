"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { postsApi } from "@/lib/api";

// Define type for user store
interface User {
  id: number;
  email: string;
  name: string;
  linkedinConnected?: boolean;
}

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
  const [facebookPosts, setFacebookPosts] = useState<Post[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("facebook");
  const user = useAuthStore((state) => state.user);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Get Facebook posts using the direct page token from backend
        // No need to check for user connection since we're using the page token directly
        const fbResponse = await postsApi.getFacebookPosts();
        console.log('Facebook posts response:', fbResponse.data);
        setFacebookPosts(fbResponse.data.data || []);
        
        // Get LinkedIn posts
        if (user?.linkedinConnected) {
          const liResponse = await postsApi.getLinkedinPosts();
          setLinkedinPosts(liResponse.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your social media posts
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="facebook" 
        value={activeTab}
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger 
            value="facebook" 
            className="flex-1"
          >
            Facebook
          </TabsTrigger>
          <TabsTrigger 
            value="linkedin" 
            disabled={!user?.linkedinConnected}
            className="flex-1"
          >
            LinkedIn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facebook">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-40 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : facebookPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No Facebook posts found</h3>
              <p className="text-muted-foreground mt-1">
                Create your first post by clicking &quot;Create Post&quot; in the sidebar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facebookPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="border rounded-md p-4 hover:bg-accent/5 transition-colors"
                >
                  <p className="line-clamp-3 mb-2">{post.message || post.content || 'No content'}</p>
                  {(post.full_picture || post.imageUrl) && (
                    <div className="relative h-32 mb-2 bg-muted rounded overflow-hidden">
                      <div 
                        style={{ backgroundImage: `url(${post.full_picture || post.imageUrl})` }}
                        className="absolute inset-0 bg-cover bg-center"
                      />
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatDate(post.created_time || post.createdAt)}</span>
                    <div className="flex gap-3">
                      <span>{post.likes || 0} likes</span>
                      <span>{post.comments || 0} comments</span>
                      <span>{post.shares || 0} shares</span>
                    </div>
                  </div>
                  {post.permalink_url && (
                    <div className="mt-2 text-xs">
                      <a 
                        href={post.permalink_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View on Facebook
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="linkedin">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-40 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : linkedinPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No LinkedIn posts found</h3>
              {!user?.linkedinConnected ? (
                <p className="text-muted-foreground mt-1">
                  Please connect your LinkedIn account in Settings
                </p>
              ) : (
                <p className="text-muted-foreground mt-1">
                  Create your first post by clicking &quot;Create Post&quot; in the sidebar
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedinPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="border rounded-md p-4 hover:bg-accent/5 transition-colors"
                >
                  <p className="line-clamp-3 mb-2">{post.content}</p>
                  {post.imageUrl && (
                    <div className="relative h-32 mb-2 bg-muted rounded overflow-hidden">
                      <div 
                        style={{ backgroundImage: `url(${post.imageUrl})` }}
                        className="absolute inset-0 bg-cover bg-center"
                      />
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatDate(post.createdAt)}</span>
                    <div className="flex gap-3">
                      <span>{post.likes || 0} likes</span>
                      <span>{post.comments || 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

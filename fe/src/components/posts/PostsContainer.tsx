"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PostsContainerProps {
  platform: "facebook" | "linkedin";
  posts: Post[];
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
  emptyMessage?: string;
  limitedPermissions?: boolean;
  profileInfo?: {
    name?: string;
    email?: string;
    profileImage?: string;
  };
}

export function PostsContainer({
  platform,
  posts,
  isLoading,
  onRefresh,
  className,
  emptyMessage = "No posts found",
  limitedPermissions = false,
  profileInfo
}: PostsContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine platform-specific classes and brand colors
  const platformClasses = {
    facebook: {
      color: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
      link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
    },
    linkedin: {
      color: "text-blue-700 dark:text-blue-400",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
      link: "text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card 
            key={i} 
            className="h-64 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  // LinkedIn with limited permissions (no posts access but profile info available)
  if (platform === "linkedin" && limitedPermissions && profileInfo) {
    return (
      <div className={cn("p-6 max-h-[calc(100vh-120px)] overflow-y-auto", className)}>
        <Card className="p-6 border-2 border-blue-100 dark:border-blue-900/30">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400 mb-3">
              Limited LinkedIn Access
            </h3>
            <p className="text-muted-foreground">
              You do not have access to fetch posts from LinkedIn.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Your current LinkedIn API permissions are limited to basic profile information.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mb-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium w-40">LinkedIn Username:</span>
                <span>{profileInfo.name || 'Not available'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-40">Email:</span>
                <span>{profileInfo.email || 'Not available'}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <p>
              To view and publish posts through LinkedIn, you need to grant additional permissions.
              Please contact your administrator to update the LinkedIn API configuration.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <a href="/api/linkedin/auth" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reconnect with Required Permissions
              </a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={cn("text-center py-16 max-h-[calc(100vh-120px)] overflow-y-auto", className)}>
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-muted-foreground mt-1">
          Create your first post by clicking &quot;Create Post&quot; in the sidebar
        </p>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            className="text-xs h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Render posts with scroll container and grid layout
  return (
    <div 
      ref={containerRef}
      className={cn(
        "max-h-[calc(100vh-120px)] overflow-y-auto pr-1 scrollbar-thin dark:scrollbar-thumb-gray-600 scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 scrollbar-track-transparent", 
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className={cn(
              "border rounded-md p-4 transition-colors h-full flex flex-col", 
              platformClasses[platform].hover
            )}
          >
            <div className="flex-grow">
              <p className="line-clamp-3 mb-2">
                {post.content || post.message || 'No content'}
              </p>
              
              {(post.imageUrl || post.full_picture) && (
                <div className="relative h-40 mb-3 bg-muted rounded overflow-hidden">
                  <div 
                    style={{ backgroundImage: `url(${post.imageUrl || post.full_picture})` }}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label="Post image"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatDate(post.createdAt || post.created_time)}</span>
                <div className="flex gap-3">
                  <span>{post.likes || 0} likes</span>
                  <span>{post.comments || 0} comments</span>
                  {post.shares && post.shares > 0 && <span>{post.shares} shares</span>}
                </div>
              </div>
              
              {post.permalink_url && (
                <div className="mt-2 text-xs">
                  <a 
                    href={post.permalink_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn("hover:underline", platformClasses[platform].link)}
                  >
                    View on {platform === 'facebook' ? 'Facebook' : 'LinkedIn'}
                  </a>
                </div>
              )}
            </div>
          </Card>
        ))}
      
      </div>
      <div className="flex justify-center py-3 mt-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRefresh}
          className="text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

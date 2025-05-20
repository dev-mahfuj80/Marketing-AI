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
}

export function PostsContainer({
  platform,
  posts,
  isLoading,
  onRefresh,
  className,
  emptyMessage = "No posts found"
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
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card 
            key={i} 
            className="h-40 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={cn("text-center py-16", className)}>
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

  // Render posts with scroll container
  return (
    <div 
      ref={containerRef}
      className={cn(
        "max-h-[70vh] overflow-y-auto pr-1 space-y-4 scrollbar-thin dark:scrollbar-thumb-gray-600 scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 scrollbar-track-transparent", 
        className
      )}
    >
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className={cn(
            "border rounded-md p-4 transition-colors", 
            platformClasses[platform].hover
          )}
        >
          <p className="line-clamp-3 mb-2">
            {post.content || post.message || 'No content'}
          </p>
          
          {(post.imageUrl || post.full_picture) && (
            <div className="relative h-32 mb-2 bg-muted rounded overflow-hidden">
              <div 
                style={{ backgroundImage: `url(${post.imageUrl || post.full_picture})` }}
                className="absolute inset-0 bg-cover bg-center"
                role="img"
                aria-label="Post image"
              />
            </div>
          )}
          
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
        </Card>
      ))}
      
      <div className="flex justify-center py-3">
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

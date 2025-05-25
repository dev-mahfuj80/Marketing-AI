"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content?: string;
  platform: "facebook" | "linkedin";
  platformId?: string | number | null;
  publishedAt?: number;
  mediaUrl?: string | null;
  engagement?: {
    impressions: number;
    reactions: number;
  };
  url?: string | null;
  // Include other fields that might be present in the Post type
  imageUrl?: string | null;
  message?: string;
  created_time?: string;
  permalink_url?: string;
}

interface LinkedInPostsContainerProps {
  posts: Post[];
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
  emptyMessage?: string;
  platform?: "facebook" | "linkedin";
}

export function LinkedInPostsContainer({ 
  posts, 
  isLoading, 
  onRefresh,
  className,
  emptyMessage = "No posts found",
  platform = "linkedin"
}: LinkedInPostsContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date helper
  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          className
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-64 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-16 max-h-[calc(100vh-120px)] overflow-y-auto",
          className
        )}
      >
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-muted-foreground mt-1">
          {platform === 'linkedin' 
            ? 'Create your first LinkedIn post by clicking &quot;Create Post&quot; in the sidebar'
            : 'No posts available'}
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

  console.log(posts);
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
            className="border rounded-md p-4 transition-colors h-full flex flex-col hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <div className="flex-grow">
              <p className="line-clamp-3 mb-2">
                {post.content || "No content"}
              </p>

              {post.mediaUrl && (
                <div className="relative h-40 mb-3 bg-muted rounded overflow-hidden">
                  <div
                    style={{
                      backgroundImage: `url(${post.mediaUrl})`
                    }}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label="Post image"
                  />
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatDate(post.publishedAt)}</span>
                <div className="flex gap-3">
                  <span>{post.engagement?.reactions || 0} reactions</span>
                  <span>{post.engagement?.impressions || 0} impressions</span>
                </div>
              </div>

              {post.url && (
                <div className="mt-2 text-xs">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    View on LinkedIn
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

"use client";

import React, { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useSocialStore } from "@/lib/store/social-store";
import Link from "next/link";

// Use separate selectors to prevent unnecessary re-renders
const useLinkedInPosts = () => useSocialStore((state) => state.linkedinPosts);
const useLoading = () => useSocialStore((state) => state.loading);
const useGetLinkedInPosts = () =>
  useSocialStore((state) => state.getLinkedInPosts);

export function LinkedInPostsContainer() {
  // Split selectors to reduce re-renders
  const posts = useLinkedInPosts();
  const loading = useLoading();
  const getLinkedInPosts = useGetLinkedInPosts();

  // Memoize the refresh function to prevent recreation on each render
  const onRefresh = useCallback(() => {
    getLinkedInPosts(0, 10);
  }, [getLinkedInPosts]);

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-64 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-lg font-medium">No LinkedIn posts found</h3>
        <p className="text-muted-foreground mt-1">
          Create your first LinkedIn post by clicking &quot;Create Post&quot; in
          the sidebar
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
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-lg font-medium">No LinkedIn posts found</h3>
        <p className="text-muted-foreground mt-1">
          Create your first LinkedIn post by clicking &quot;Create Post&quot; in
          the sidebar
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
  } else if (loading) {
    return (
      <div className="text-center py-16 min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] overflow-y-auto flex items-center justify-center ">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-2 text-muted-foreground mb-2">
          Loading LinkedIn posts...
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-1 scrollbar-thin dark:scrollbar-thumb-gray-600 scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="border rounded-md p-4 transition-colors h-full flex flex-col hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <div className="flex-grow">
              <p className="line-clamp-3 mb-2">
                {post?.text?.text || "No content"}{" "}
              </p>
              {post?.content?.contentEntities?.[0]?.thumbnails?.[0]
                ?.resolvedUrl && (
                <div className="relative h-40 mb-3 bg-muted rounded overflow-hidden">
                  <div
                    style={{
                      backgroundImage: `url(${post?.content?.contentEntities?.[0]?.thumbnails?.[0]?.resolvedUrl})`,
                    }}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label="Post image"
                  />
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Date: {new Date(post?.created?.time).toLocaleDateString()}
                </span>
              </div>

              {post?.activity && (
                <div className="text-xs">
                  <Link
                    href={
                      "https://www.linkedin.com/feed/update/" + post.activity
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    View on LinkedIn
                  </Link>
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
          className="text-xs cursor-pointer"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

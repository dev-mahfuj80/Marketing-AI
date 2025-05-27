"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/lib/store/social-store";
import { Card } from "../ui/card";
import Link from "next/link";

// Use separate selectors to prevent unnecessary re-renders
const useFacebookPosts = () => useSocialStore((state) => state.facebookPosts);
const useLoading = () => useSocialStore((state) => state.loading);
const useGetFacebookPosts = () =>
  useSocialStore((state) => state.getFacebookPosts);

export function FacebookPostsContainer() {
  // Split selectors to reduce re-renders
  const posts = useFacebookPosts();
  const loading = useLoading();
  const getFacebookPosts = useGetFacebookPosts();

  // Format date helper - memoized to prevent recreating on each render
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Memoize the refresh function to prevent recreation on each render
  const onRefresh = useCallback(() => {
    getFacebookPosts("me", 0, 10);
  }, [getFacebookPosts]);

  console.log(posts);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="text-lg font-medium">No Facebook posts found</h3>
        <p className="text-muted-foreground mt-1">
          Create your first Facebook post by clicking &quot;Create Post&quot; in
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
          Loading Facebook posts...
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
            className={cn(
              "border rounded-md p-4 transition-colors h-full flex flex-col"
            )}
          >
            <div className="flex-grow">
              <p className="line-clamp-3 mb-2">
                {post.content || post.content || "No content"}
              </p>

              {post.picture && (
                <div className="relative h-40 mb-3 bg-muted rounded overflow-hidden">
                  <div
                    style={{
                      backgroundImage: `url(${post.picture || ""})`,
                    }}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    aria-label="Post image"
                    onClick={() => {
                      // Log which image field is being used
                      console.log(
                        "Image displayed from field:",
                        post.picture ? "picture" : ""
                      );
                    }}
                  />
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatDate(post.publishedAt)}</span>
                <div className="flex gap-3">
                  <span>{post.likes || 0} likes</span>
                  <span>{post.comments || 0} comments</span>
                  <span>{post.shares || 0} shares</span>
                </div>
              </div>

              {post.url && (
                <div className="mt-2 text-xs">
                  <Link
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    View on Facebook
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

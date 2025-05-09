"use client";

import PostList from '@/components/dashboard/post-list';

// Client components cannot export metadata
// Page title is now controlled by the layout.tsx file

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <a 
          href="/dashboard/create-post"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Create New Post
        </a>
      </div>
      
      <div className="rounded-lg border bg-white shadow-sm">
        <PostList />
      </div>
    </div>
  );
}

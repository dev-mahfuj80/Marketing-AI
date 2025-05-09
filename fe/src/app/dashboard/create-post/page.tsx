"use client";

import { CreatePostForm } from '@/components/dashboard/create-post-form';

// Client components cannot export metadata
// Page title is controlled by the layout.tsx file

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Post</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <CreatePostForm />
      </div>
    </div>
  );
}

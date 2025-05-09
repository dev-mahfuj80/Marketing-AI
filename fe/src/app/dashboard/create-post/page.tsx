import { Metadata } from 'next';
import { CreatePostForm } from '@/components/dashboard/create-post-form';

export const metadata: Metadata = {
  title: 'Create Post | Marketing AI Dashboard',
  description: 'Create and publish posts to your social media accounts',
};

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

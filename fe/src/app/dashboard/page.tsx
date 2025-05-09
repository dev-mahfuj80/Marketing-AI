"use client";

import { Facebook, Linkedin, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Client components cannot export metadata
// Page title is controlled by the layout.tsx file

export default function DashboardPage() {
  const router = useRouter();
  
  // This would normally fetch data from the backend
  // Will be implemented with actual data fetching in a future step
  
  return (
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Platform Connection Cards */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Facebook className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Facebook</h3>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Not Connected
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Connect Account
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Linkedin className="h-6 w-6 text-blue-800" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">LinkedIn</h3>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Not Connected
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
                Connect Account
              </button>
            </div>
          </div>
        </div>

        {/* Quick Post Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Create Post</h3>
            <p className="mt-1 text-sm text-gray-500">
              Quickly create a new post for your social media accounts
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => router.push('/dashboard/create-post')}
              >
                Create New Post
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Recent Posts</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No recent posts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your social media accounts to view your recent posts
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

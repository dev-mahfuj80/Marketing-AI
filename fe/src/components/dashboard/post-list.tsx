"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostMedia } from '@/components/dashboard/post-media';
import { Loader2, Facebook, Linkedin, Calendar, MessageSquare, ThumbsUp, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';

// API base URL - this should come from env variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Post interface
interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  platform: 'FACEBOOK' | 'LINKEDIN';
  likes: number;
  comments: number;
  shares?: number;
  createdAt: string;
  platformPostId: string;
  link?: string;
}

// Type for post data from API responses
interface PostData {
  id: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  shares?: number;
  createdAt: string;
  platformPostId: string;
  link?: string;
  [key: string]: unknown;
}

export default function PostList() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState<boolean>(false);
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Fetch Facebook posts - using useCallback to prevent infinite dependency loop
  const fetchFacebookPosts = useCallback(async () => {
    setIsLoadingFacebook(true);
    try {
      const response = await axios.get(`${API_URL}/api/posts/facebook`, {
        withCredentials: true,
      });
      
      const facebookPosts = response.data.posts.map((post: PostData) => ({
        ...post,
        platform: 'FACEBOOK' as const,
      }));
      
      setPosts(prevPosts => {
        // Filter out existing Facebook posts and add new ones
        const filteredPosts = prevPosts.filter(p => p.platform !== 'FACEBOOK');
        return [...filteredPosts, ...facebookPosts];
      });
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      console.error('Error fetching Facebook posts:', error);
      setError('Failed to fetch Facebook posts. Please try again.');
    } finally {
      setIsLoadingFacebook(false);
    }
  }, []);

  // Fetch LinkedIn posts - using useCallback to prevent infinite dependency loop
  const fetchLinkedInPosts = useCallback(async () => {
    setIsLoadingLinkedIn(true);
    try {
      const response = await axios.get(`${API_URL}/api/posts/linkedin`, {
        withCredentials: true,
      });
      
      const linkedInPosts = response.data.posts.map((post: PostData) => ({
        ...post,
        platform: 'LINKEDIN' as const,
      }));
      
      setPosts(prevPosts => {
        // Filter out existing LinkedIn posts and add new ones
        const filteredPosts = prevPosts.filter(p => p.platform !== 'LINKEDIN');
        return [...filteredPosts, ...linkedInPosts];
      });
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      console.error('Error fetching LinkedIn posts:', error);
      setError('Failed to fetch LinkedIn posts. Please try again.');
    } finally {
      setIsLoadingLinkedIn(false);
    }
  }, []);

  // Fetch posts function wrapped in useCallback to use in dependency array
  const fetchPosts = useCallback(async () => {
    setError(null);
    
    if (user?.facebookToken) {
      fetchFacebookPosts();
    }
    
    if (user?.linkedInToken) {
      fetchLinkedInPosts();
    }
  }, [user?.facebookToken, user?.linkedInToken, fetchFacebookPosts, fetchLinkedInPosts]);

  // Fetch posts on component mount
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    return post.platform.toLowerCase() === activeTab.toLowerCase();
  });

  // Sort posts by creation date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Platform connection status
  const isFacebookConnected = !!user?.facebookToken;
  const isLinkedInConnected = !!user?.linkedInToken;
  const isLoading = isLoadingFacebook || isLoadingLinkedIn;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Posts</h2>
        
        <button
          onClick={() => fetchPosts()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}
      
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="facebook" disabled={!isFacebookConnected}>
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="linkedin" disabled={!isLinkedInConnected}>
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </TabsTrigger>
        </TabsList>
        
      <TabsContent value={activeTab}>
        {sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
            {isLoading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm text-gray-500">Loading posts...</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No posts found</p>
                <p className="mt-1 text-sm text-gray-500">
                  {!isFacebookConnected && !isLinkedInConnected
                    ? 'Connect your social media accounts to view posts'
                    : 'Create your first post using the "Create New Post" button'}
                </p>
                {(!isFacebookConnected || !isLinkedInConnected) && (
                  <a
                    href="/dashboard/settings"
                    className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Go to Settings
                  </a>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedPosts.map((post) => (
              <div key={post.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    {post.platform === 'FACEBOOK' ? (
                      <Facebook className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    )}
                    <span className="ml-2 font-medium">
                      {post.platform === 'FACEBOOK' ? 'Facebook' : 'LinkedIn'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <p className="mb-4 text-sm">{post.content}</p>
                  {post.mediaUrl && (
                    <PostMedia mediaUrl={post.mediaUrl} />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">{post.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">{post.comments}</span>
                      </div>
                    </div>
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View Post
                      </a>
                    )}
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

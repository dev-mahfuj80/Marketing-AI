"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

// API base URL - this should come from env variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create post form validation schema
const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(500, 'Post content must be less than 500 characters'),
  mediaUrl: z.string().url('Please enter a valid URL').or(z.string().length(0)).optional(),
  platforms: z.array(z.enum(['FACEBOOK', 'LINKEDIN'])).refine(val => val.length > 0, {
    message: 'Select at least one platform',
  }),
  scheduledDate: z.string().optional(),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      mediaUrl: '',
      platforms: [],
      scheduledDate: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: CreatePostFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.post(
        `${API_URL}/api/posts`,
        data,
        {
          withCredentials: true,
        }
      );
      
      setSuccess('Post created successfully!');
      form.reset();
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook connection status
  const isFacebookConnected = !!user?.facebookToken;
  
  // LinkedIn connection status
  const isLinkedInConnected = !!user?.linkedInToken;

  // Handle platform checkbox change
  const handlePlatformChange = (platform: 'FACEBOOK' | 'LINKEDIN') => {
    const currentPlatforms = form.getValues('platforms');
    const platformIndex = currentPlatforms.indexOf(platform);
    
    if (platformIndex === -1) {
      form.setValue('platforms', [...currentPlatforms, platform]);
    } else {
      form.setValue('platforms', currentPlatforms.filter(p => p !== platform));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <Form form={form} onSubmit={onSubmit}>
        {/* Select Platforms */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-medium">Select Platforms</h2>
          <div className="flex flex-wrap gap-4">
            <div className={`relative flex items-center rounded-md border p-4 ${!isFacebookConnected ? 'cursor-not-allowed opacity-60' : ''}`}>
              <input
                type="checkbox"
                id="facebook-platform"
                className="mr-2"
                checked={form.getValues('platforms').includes('FACEBOOK')}
                onChange={() => handlePlatformChange('FACEBOOK')}
                disabled={!isFacebookConnected || isLoading}
              />
              <label 
                htmlFor="facebook-platform" 
                className={`cursor-pointer text-sm font-medium ${!isFacebookConnected ? 'cursor-not-allowed' : ''}`}
              >
                Facebook
              </label>
              {!isFacebookConnected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-gray-100/80">
                  <a href="/dashboard/settings" className="text-xs font-medium text-primary hover:underline">
                    Connect Facebook
                  </a>
                </div>
              )}
            </div>

            <div className={`relative flex items-center rounded-md border p-4 ${!isLinkedInConnected ? 'cursor-not-allowed opacity-60' : ''}`}>
              <input
                type="checkbox"
                id="linkedin-platform"
                className="mr-2"
                checked={form.getValues('platforms').includes('LINKEDIN')}
                onChange={() => handlePlatformChange('LINKEDIN')}
                disabled={!isLinkedInConnected || isLoading}
              />
              <label 
                htmlFor="linkedin-platform" 
                className={`cursor-pointer text-sm font-medium ${!isLinkedInConnected ? 'cursor-not-allowed' : ''}`}
              >
                LinkedIn
              </label>
              {!isLinkedInConnected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-gray-100/80">
                  <a href="/dashboard/settings" className="text-xs font-medium text-primary hover:underline">
                    Connect LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
          {form.formState.errors.platforms && (
            <p className="mt-2 text-sm text-red-600">{form.formState.errors.platforms.message}</p>
          )}
        </div>

        {/* Post Content */}
        <FormField name="content">
          <FormLabel>Post Content</FormLabel>
          <FormControl>
            <textarea
              className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your post content here..."
              {...form.register('content')}
              disabled={isLoading}
            />
          </FormControl>
          <div className="mt-1 text-xs text-gray-500">
            {form.watch('content').length}/500 characters
          </div>
          <FormMessage name="content" />
        </FormField>

        {/* Media URL */}
        <FormField name="mediaUrl">
          <FormLabel>Media URL (Optional)</FormLabel>
          <FormControl>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              {...form.register('mediaUrl')}
              disabled={isLoading}
            />
          </FormControl>
          <div className="mt-1 text-xs text-gray-500">
            Add an image or video URL to include in your post
          </div>
          <FormMessage name="mediaUrl" />
        </FormField>

        {/* Schedule Post */}
        <FormField name="scheduledDate">
          <FormLabel>Schedule Post (Optional)</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="datetime-local"
                {...form.register('scheduledDate')}
                disabled={isLoading}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormControl>
          <div className="mt-1 text-xs text-gray-500">
            Schedule your post for a future date and time
          </div>
          <FormMessage name="scheduledDate" />
        </FormField>

        {/* Submit Button */}
        <Button
          type="submit"
          className="mt-6"
          disabled={isLoading || (!isFacebookConnected && !isLinkedInConnected)}
        >
          {isLoading ? 'Creating Post...' : 'Create Post'}
        </Button>
      </Form>
    </div>
  );
}

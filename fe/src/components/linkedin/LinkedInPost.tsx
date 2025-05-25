"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Image as ImageIcon, Link as LinkIcon, Send, ExternalLink } from "lucide-react";
import { linkedinApi } from "@/lib/api";
// Utility functions
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  link?: string;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface LinkedInConnectionStatus {
  connected: boolean;
  loading: boolean;
  oauthUrl?: string;
  message?: string;
  permissionNote?: string;
  nextSteps?: string;
}

interface LinkedInPostProps {
  onPostCreated?: () => void;
}

export function LinkedInPost({ onPostCreated }: LinkedInPostProps) {
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<LinkedInConnectionStatus>({
    connected: false,
    loading: true
  });

  // Fetch connection status and posts on component mount
  useEffect(() => {
    checkConnectionStatus();
    fetchPosts();
  }, []);

  // Check LinkedIn connection status
  const checkConnectionStatus = async () => {
    try {
      const response = await linkedinApi.getProfileInfo();
      
      setConnectionStatus({
        connected: response.data.connected,
        loading: false,
        oauthUrl: response.data.oauthUrl || undefined,
        message: response.data.message || undefined,
        permissionNote: response.data.permissionNote || undefined,
        nextSteps: response.data.nextSteps || undefined
      });
      
      // If there's an error message, log it and may show it to the user
      if (response.data.message && response.data.connected === false) {
        console.warn('LinkedIn connection issue:', response.data.message);
      }
    } catch (error) {
      console.error('Error checking LinkedIn connection status:', error);
      setConnectionStatus({
        connected: false,
        loading: false
      });
    }
  };

  // Fetch posts from LinkedIn
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await linkedinApi.getPagePosts();
      
      // Transform the response to match our Post interface
      type LinkedInApiPost = {
        id?: string;
        specificContent?: {
          'com.linkedin.ugc.ShareContent'?: {
            shareCommentary?: { text?: string };
            media?: Array<{ originalUrl?: string }>
          }
        };
        created?: { time?: number };
      };

      const formattedPosts = response.data.elements?.map((post: LinkedInApiPost) => ({
        id: post.id || `post-${Math.random().toString(36).substr(2, 9)}`,
        content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
        imageUrl: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.[0]?.originalUrl,
        link: post.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.[0]?.originalUrl,
        createdAt: post.created?.time ? new Date(post.created.time).toISOString() : new Date().toISOString(),
        author: {
          name: 'LinkedIn User',
          avatar: '/linkedin-avatar.png'
        }
      })) || [];
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching LinkedIn posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit post to LinkedIn
  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      await linkedinApi.publishPost(postContent, imageUrl, link);
      
      // Reset form and refresh posts
      setPostContent('');
      setImageUrl('');
      setLink('');
      setShowImageInput(false);
      setShowLinkInput(false);
      
      // Fetch latest posts
      fetchPosts();
      
      // Notify parent component
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating LinkedIn post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Format ISO date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Toggle between image and link inputs (can't have both in LinkedIn)
  const toggleImageInput = () => {
    setShowImageInput(!showImageInput);
    if (!showImageInput) {
      setShowLinkInput(false);
      setLink('');
    }
  };

  const toggleLinkInput = () => {
    setShowLinkInput(!showLinkInput);
    if (!showLinkInput) {
      setShowImageInput(false);
      setImageUrl('');
    }
  };

  if (connectionStatus.loading) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", "transition-all")}>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (!connectionStatus.connected) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", "transition-all")}>
        <CardHeader className="border-b">
          <div className={cn("flex items-center space-x-4")}>
            <Avatar>
              <AvatarImage src="/linkedin-avatar.png" />
              <AvatarFallback>LI</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">LinkedIn Connection Required</CardTitle>
              <p className="text-sm text-muted-foreground">Connect your account to share updates with your network</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <div className={cn("bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 border rounded-md p-4 text-amber-800 dark:text-amber-200 text-sm mb-4 w-full")}>
            <p className="font-medium mb-1">LinkedIn authentication is required</p>
            <p>{connectionStatus.permissionNote || 'To post content and view your LinkedIn posts, you need to connect your LinkedIn account.'}</p>
            {connectionStatus.nextSteps && (
              <p className="mt-2 text-amber-700 dark:text-amber-300">{connectionStatus.nextSteps}</p>
            )}
          </div>
          <div className={cn("flex gap-3")}>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard/settings'}
            >
              Go to Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className={cn("flex items-center space-x-4")}>
          <Avatar>
            <AvatarImage src="/linkedin-avatar.png" />
            <AvatarFallback>LI</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">LinkedIn</CardTitle>
            <p className="text-sm text-muted-foreground">Share updates with your professional network</p>
          </div>
        </div>
      </CardHeader>
      
      <div className="border-b">
        <div className={cn("flex")}>
          <button
            className={cn(
              "flex-1 py-3 text-center font-medium transition-colors",
              activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
            )}
            onClick={() => setActiveTab('create')}
          >
            Create Post
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-center font-medium transition-colors",
              activeTab === 'view' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
            )}
            onClick={() => setActiveTab('view')}
          >
            View Posts
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handlePostSubmit}>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Share something with your network..."
              className="min-h-[100px] text-base"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            {showImageInput && (
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            )}
            
            {showLinkInput && (
              <div className="space-y-2">
                <Label htmlFor="link-url">Link URL</Label>
                <Input
                  id="link-url"
                  placeholder="Enter link URL"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            )}

            <div className={cn("flex justify-between items-center pt-2")}>
              <div className={cn("flex space-x-2")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleImageInput}
                  className={showImageInput ? "bg-blue-100" : ""}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleLinkInput}
                  className={showLinkInput ? "bg-blue-100" : ""}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </Button>
              </div>
              <Button type="submit" disabled={isPosting || !postContent.trim()}>
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post to LinkedIn
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      ) : (
        <CardContent className="p-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No LinkedIn posts to display.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader className="p-4 bg-muted/20">
                    <div className={cn("flex items-center space-x-3")}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>LI</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                    
                    {post.imageUrl && !post.link && (
                      <div className="mt-4 rounded-md overflow-hidden border">
                        {/* Using a div with background image instead of img tag for better performance */}
                        <div 
                          className="w-full h-48 bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.imageUrl})` }}
                          role="img"
                          aria-label="Post image"
                        />
                      </div>
                    )}
                    
                    {post.link && (
                      <div className="mt-4 border rounded-md overflow-hidden">
                        <a 
                          href={post.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 hover:bg-muted/20"
                        >
                          <div className={cn("flex items-center space-x-2")}>
                            <LinkIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-500 truncate">{post.link}</span>
                          </div>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={fetchPosts}
              disabled={isLoading}
              className="text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh Posts'
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

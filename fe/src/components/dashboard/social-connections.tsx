"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Facebook, Linkedin, ExternalLink, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';

// API base URL - this should come from env variables in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function SocialConnections() {
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [isDisconnectingFacebook, setIsDisconnectingFacebook] = useState(false);
  const [isDisconnectingLinkedIn, setIsDisconnectingLinkedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser } = useAuthStore();

  const handleFacebookConnect = async () => {
    setIsConnectingFacebook(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/social/facebook`, {
        withCredentials: true,
      });
      
      // Redirect to Facebook OAuth URL
      window.location.href = response.data.authUrl;
    } catch (err) {
      const error = err as Error | { response?: { data?: { message?: string } } };
      console.error('Error initiating Facebook OAuth:', error);
      setError('Failed to connect to Facebook. Please try again.');
      setIsConnectingFacebook(false);
    }
  };

  const handleLinkedInConnect = async () => {
    setIsConnectingLinkedIn(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/social/linkedin`, {
        withCredentials: true,
      });
      
      // Redirect to LinkedIn OAuth URL
      window.location.href = response.data.authUrl;
    } catch (err) {
      const error = err as Error | { response?: { data?: { message?: string } } };
      console.error('Error initiating LinkedIn OAuth:', error);
      setError('Failed to connect to LinkedIn. Please try again.');
      setIsConnectingLinkedIn(false);
    }
  };

  const handleFacebookDisconnect = async () => {
    setIsDisconnectingFacebook(true);
    setError(null);
    
    try {
      await axios.delete(`${API_URL}/api/social/facebook/disconnect`, {
        withCredentials: true,
      });
      
      // Update user state to reflect disconnection
      if (user) {
        updateUser({
          ...user,
          facebookToken: null,
          facebookTokenExpiry: null,
        });
      }
    } catch (err) {
      const error = err as Error | { response?: { data?: { message?: string } } };
      console.error('Error disconnecting Facebook:', error);
      setError('Failed to disconnect from Facebook. Please try again.');
    } finally {
      setIsDisconnectingFacebook(false);
    }
  };

  const handleLinkedInDisconnect = async () => {
    setIsDisconnectingLinkedIn(true);
    setError(null);
    
    try {
      await axios.delete(`${API_URL}/api/social/linkedin/disconnect`, {
        withCredentials: true,
      });
      
      // Update user state to reflect disconnection
      if (user) {
        updateUser({
          ...user,
          linkedInToken: null,
          linkedInTokenExpiry: null,
        });
      }
    } catch (err) {
      const error = err as Error | { response?: { data?: { message?: string } } };
      console.error('Error disconnecting LinkedIn:', error);
      setError('Failed to disconnect from LinkedIn. Please try again.');
    } finally {
      setIsDisconnectingLinkedIn(false);
    }
  };

  const isFacebookConnected = !!user?.facebookToken;
  const isLinkedInConnected = !!user?.linkedInToken;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Facebook Connection */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Facebook className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-medium">Facebook</h3>
            <p className="text-sm text-gray-500">
              {isFacebookConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        
        {isFacebookConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFacebookDisconnect}
            disabled={isDisconnectingFacebook}
            className="flex items-center"
          >
            {isDisconnectingFacebook ? (
              <span className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Disconnecting...
              </span>
            ) : (
              <span className="flex items-center">
                <X className="mr-1 h-3 w-3" />
                Disconnect
              </span>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleFacebookConnect}
            disabled={isConnectingFacebook}
            className="flex items-center"
          >
            {isConnectingFacebook ? (
              <span className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <ExternalLink className="mr-1 h-3 w-3" />
                Connect
              </span>
            )}
          </Button>
        )}
      </div>

      {/* LinkedIn Connection */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Linkedin className="h-5 w-5 text-blue-700" />
          </div>
          <div className="ml-4">
            <h3 className="font-medium">LinkedIn</h3>
            <p className="text-sm text-gray-500">
              {isLinkedInConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        
        {isLinkedInConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedInDisconnect}
            disabled={isDisconnectingLinkedIn}
            className="flex items-center"
          >
            {isDisconnectingLinkedIn ? (
              <span className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Disconnecting...
              </span>
            ) : (
              <span className="flex items-center">
                <X className="mr-1 h-3 w-3" />
                Disconnect
              </span>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleLinkedInConnect}
            disabled={isConnectingLinkedIn}
            className="flex items-center"
          >
            {isConnectingLinkedIn ? (
              <span className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <ExternalLink className="mr-1 h-3 w-3" />
                Connect
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="mt-4 rounded-md bg-muted p-4 text-xs text-muted-foreground">
        <p className="font-medium">Why connect your social accounts?</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>View and analyze your social media posts in one place</li>
          <li>Create and schedule posts across multiple platforms</li>
          <li>Get insights on post performance and engagement</li>
        </ul>
      </div>
    </div>
  );
}

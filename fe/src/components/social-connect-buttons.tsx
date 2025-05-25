"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SocialConnectButtonsProps {
  onRefresh?: () => void;
}

interface ConnectionStatus {
  facebook: boolean;
  linkedin: boolean;
  facebookCredentialsValid: boolean;
  linkedinCredentialsValid: boolean;
}

export function SocialConnectButtons({ onRefresh }: SocialConnectButtonsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState<{
    facebook: boolean;
    linkedin: boolean;
  }>({
    facebook: false,
    linkedin: false,
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    facebook: false,
    linkedin: false,
    facebookCredentialsValid: false,
    linkedinCredentialsValid: false,
  });

  // Fetch connection status on mount
  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  // Fetch connection status from API
  const fetchConnectionStatus = async () => {
    setIsLoading(true);
    try {
      // Check Facebook connection status
      let facebookStatus = {
        connected: false,
        credentialsValid: false
      };
      
      try {
        const fbResponse = await fetch('/api/facebook/status');
        if (fbResponse.ok) {
          const fbData = await fbResponse.json();
          facebookStatus = {
            connected: fbData.connected,
            credentialsValid: fbData.credentialsValid || fbData.connected
          };
        }
      } catch (fbError) {
        console.error("Error checking Facebook status:", fbError);
      }
      
      // Check LinkedIn connection status
      let linkedinStatus = {
        connected: false,
        credentialsValid: false
      };
      
      try {
        const liResponse = await fetch('/api/linkedin/status');
        if (liResponse.ok) {
          const liData = await liResponse.json();
          linkedinStatus = {
            connected: liData.connected,
            credentialsValid: liData.credentialsValid || liData.connected
          };
        }
      } catch (liError) {
        console.error("Error checking LinkedIn status:", liError);
      }

      setConnectionStatus({
        facebook: facebookStatus.connected,
        linkedin: linkedinStatus.connected,
        facebookCredentialsValid: facebookStatus.credentialsValid,
        linkedinCredentialsValid: linkedinStatus.credentialsValid
      });
    } catch (error) {
      console.error("Error fetching connection status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data after status change
  const refreshData = () => {
    if (onRefresh) {
     
      onRefresh();
    }
  };

  // Check connection status for Facebook
  const checkFacebookStatus = async () => {
    setCheckingStatus(prev => ({ ...prev, facebook: true }));
    
    try {
      const response = await fetch(`/api/facebook/status`);
      if (response.ok) {
        const data = await response.json();
        
        setConnectionStatus(prev => ({
          ...prev,
          facebook: data.connected,
          facebookCredentialsValid: data.credentialsValid || data.connected
        }));
      }
    } catch (error) {
      console.error(`Error checking Facebook status:`, error);
    } finally {
      setCheckingStatus(prev => ({ ...prev, facebook: false }));
      refreshData();
    }
  };

  // Check connection status for LinkedIn
  const checkLinkedInStatus = async () => {
    setCheckingStatus(prev => ({ ...prev, linkedin: true }));
    
    try {
     
      // Make a direct fetch call to get the raw response
      const response = await fetch('/api/linkedin/status');
      
      if (response.ok) {
        const data = await response.json();
        console.log('LinkedIn connection data:', data);
        
        setConnectionStatus(prev => ({
          ...prev,
          linkedin: data.connected,
          linkedinCredentialsValid: data.credentialsValid || data.connected
        }));
      } else {
        console.error(`LinkedIn status check failed with status: ${response.status}`);
        // Handle non-200 responses gracefully
        setConnectionStatus(prev => ({
          ...prev,
          linkedin: false,
          linkedinCredentialsValid: false
        }));
      }
    } catch (error) {
      console.error(`Error checking LinkedIn status:`, error);
      // Reset connection status on error
      setConnectionStatus(prev => ({
        ...prev,
        linkedin: false,
        linkedinCredentialsValid: false
      }));
    } finally {
      setCheckingStatus(prev => ({ ...prev, linkedin: false }));
      refreshData();
    }
  };
  
  // Initiate LinkedIn OAuth flow
  const connectLinkedIn = async () => {
    setCheckingStatus(prev => ({ ...prev, linkedin: true }));
    
    try {
      // Get the auth URL from the backend
      
      
      // Using the enhanced API client, the data is returned directly, not nested in data property
     
    } catch (error) {
      console.error("Error initiating LinkedIn authentication:", error);
      alert("Could not connect to LinkedIn: " + (error instanceof Error ? error.message : "Unknown error"));
      setCheckingStatus(prev => ({ ...prev, linkedin: false }));
    }
  };
  
  // Disconnect LinkedIn account
  const disconnectLinkedIn = async () => {
    setCheckingStatus(prev => ({ ...prev, linkedin: true }));
    
    try {
      
      // Update connection status
      setConnectionStatus(prev => ({
        ...prev,
        linkedin: false,
        linkedinCredentialsValid: false
      }));
      
      // Refresh posts list if callback provided
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error disconnecting LinkedIn account:", error);
    } finally {
      setCheckingStatus(prev => ({ ...prev, linkedin: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 items-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking connections...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Facebook Button */}
      <Button
        size="sm"
        variant={connectionStatus.facebookCredentialsValid ? "outline" : "default"}
        className="flex items-center gap-1"
        onClick={checkFacebookStatus}
        disabled={checkingStatus.facebook}
      >
        {checkingStatus.facebook ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Facebook className="h-4 w-4 mr-1" />
        )}
        {connectionStatus.facebookCredentialsValid ? (
          <span className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Connected
          </span>
        ) : (
          <span className="flex items-center">
            <XCircle className="h-3 w-3 mr-1 text-red-500" />
            Facebook
          </span>
        )}
      </Button>

      {/* LinkedIn Button */}
      <Button
        size="sm"
        variant={connectionStatus.linkedinCredentialsValid ? "outline" : "default"}
        className="flex items-center gap-1"
        onClick={() => {
          if (connectionStatus.linkedinCredentialsValid) {
            disconnectLinkedIn();
          } else {
            // First check status, if already connected then update UI
            checkLinkedInStatus();
            // Otherwise initiate connection flow
            if (!connectionStatus.linkedinCredentialsValid) {
              connectLinkedIn();
            }
          }
        }}
        disabled={checkingStatus.linkedin}
      >
        {checkingStatus.linkedin ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Linkedin className="h-4 w-4 mr-1" />
        )}
        {connectionStatus.linkedinCredentialsValid ? (
          <span className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Disconnect
          </span>
        ) : (
          <span className="flex items-center">
            <XCircle className="h-3 w-3 mr-1 text-red-500" />
            Connect LinkedIn
          </span>
        )}
      </Button>
    </div>
  );
}

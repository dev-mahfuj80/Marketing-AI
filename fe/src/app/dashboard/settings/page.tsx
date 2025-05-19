"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Linkedin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { postsApi } from "@/lib/api";

interface ConnectionStatus {
  facebook: boolean;
  linkedin: boolean;
  lastSyncFacebook: string | null;
  lastSyncLinkedin: string | null;
  // These will be false if the credentials are missing or invalid
  facebookCredentialsValid: boolean;
  linkedinCredentialsValid: boolean;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    facebook: false,
    linkedin: false,
    lastSyncFacebook: null,
    lastSyncLinkedin: null,
    facebookCredentialsValid: false,
    linkedinCredentialsValid: false,
  });

  // Type-safe selectors
  const user = useAuthStore((state) => state.user);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Fetch connection status from API
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Check Facebook connection status
        let facebookStatus = {
          connected: false,
          lastSync: null,
          credentialsValid: false
        };
        
        try {
          // Try to get Facebook status
          const fbResponse = await fetch('/api/facebook/status');
          if (fbResponse.ok) {
            const fbData = await fbResponse.json();
            facebookStatus = {
              connected: fbData.connected,
              lastSync: fbData.lastSync,
              credentialsValid: fbData.credentialsValid || fbData.connected
            };
          }
        } catch (fbError) {
          console.error("Error checking Facebook status:", fbError);
        }
        
        // Check LinkedIn connection status
        let linkedinStatus = {
          connected: false,
          lastSync: null,
          credentialsValid: false
        };
        
        try {
          // Try to get LinkedIn status
          const liResponse = await fetch('/api/linkedin/status');
          if (liResponse.ok) {
            const liData = await liResponse.json();
            linkedinStatus = {
              connected: liData.connected,
              lastSync: liData.lastSync,
              credentialsValid: liData.credentialsValid || liData.connected
            };
          }
        } catch (liError) {
          console.error("Error checking LinkedIn status:", liError);
        }

        setConnectionStatus({
          facebook: facebookStatus.connected,
          linkedin: linkedinStatus.connected,
          lastSyncFacebook: facebookStatus.lastSync,
          lastSyncLinkedin: linkedinStatus.lastSync,
          facebookCredentialsValid: facebookStatus.credentialsValid,
          linkedinCredentialsValid: linkedinStatus.credentialsValid
        });
      } catch (error) {
        console.error("Error fetching connection status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchConnectionStatus();
    } else {
      // If no user, try to check auth status
      checkAuthStatus();
      setIsLoading(false);
    }
  }, [user, checkAuthStatus]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // We no longer need getApiBaseUrl as we're using the authApi functions directly

  // These functions are no longer needed since we're using direct API credentials
  // We'll replace them with functions to check API status
  
  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check Facebook connection status
      try {
        // Test Facebook credentials by trying to fetch posts
        await postsApi.getFacebookPosts();
        
        // If we get here, credentials are valid
        setConnectionStatus(prev => ({
          ...prev,
          facebook: true,
          facebookCredentialsValid: true,
          lastSyncFacebook: new Date().toISOString()
        }));
      } catch (fbError) {
        console.error("Error checking Facebook connection:", fbError);
        setConnectionStatus(prev => ({
          ...prev,
          facebook: false,
          facebookCredentialsValid: false
        }));
      }
      
      // Check LinkedIn connection status
      try {
        // Test LinkedIn credentials by trying to fetch posts
        await postsApi.getLinkedinPosts();
        
        // If we get here, credentials are valid
        setConnectionStatus(prev => ({
          ...prev,
          linkedin: true,
          linkedinCredentialsValid: true,
          lastSyncLinkedin: new Date().toISOString()
        }));
      } catch (liError) {
        console.error("Error checking LinkedIn connection:", liError);
        setConnectionStatus(prev => ({
          ...prev,
          linkedin: false,
          linkedinCredentialsValid: false
        }));
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your social media connections
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Social Media Connections</h2>
            <p className="text-muted-foreground">
              API connection status for direct posting to social platforms
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={checkConnectionStatus}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Check Status
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Facebook Connection */}
            <div className="flex items-start justify-between flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <Facebook size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Facebook</h3>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.facebookCredentialsValid ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} />
                        API Credentials Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={14} />
                        API Credentials Invalid
                      </span>
                    )}
                  </p>
                  {connectionStatus.lastSyncFacebook && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last checked: {formatDate(connectionStatus.lastSyncFacebook)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Key size={12} />
                      Using Page Access Token from server environment
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={connectionStatus.facebookCredentialsValid ? "outline" : "default"}
                  size="sm"
                  onClick={checkConnectionStatus}
                >
                  {connectionStatus.facebookCredentialsValid ? "Verify" : "Check Status"}
                </Button>
              </div>
            </div>

            {/* LinkedIn Connection */}
            <div className="flex items-start justify-between flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-800 text-white p-2 rounded-full">
                  <Linkedin size={24} />
                </div>
                <div>
                  <h3 className="font-medium">LinkedIn</h3>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.linkedinCredentialsValid ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} />
                        API Credentials Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={14} />
                        API Credentials Invalid
                      </span>
                    )}
                  </p>
                  {connectionStatus.lastSyncLinkedin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last checked: {formatDate(connectionStatus.lastSyncLinkedin)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Key size={12} />
                      Using Client ID and Secret from server environment
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={connectionStatus.linkedinCredentialsValid ? "outline" : "default"}
                  size="sm"
                  onClick={checkConnectionStatus}
                >
                  {connectionStatus.linkedinCredentialsValid ? "Verify" : "Check Status"}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-md border border-muted">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-muted-foreground mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-medium">About API Credentials</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This application uses direct API access to post to social media platforms. The credentials are configured in the server environment variables and are not managed through this interface.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact your system administrator if you need to update or change the API credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <p className="text-muted-foreground mb-4">
          Manage your account preferences and personal information
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Email Address</h3>
            <p className="text-muted-foreground">
              {user?.email || "Loading..."}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Name</h3>
            <p className="text-muted-foreground">
              {user?.name || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

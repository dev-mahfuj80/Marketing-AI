"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Linkedin,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authApi } from "@/lib/api";

interface ConnectionStatus {
  facebook: boolean;
  linkedin: boolean;
  lastSyncFacebook: string | null;
  lastSyncLinkedin: string | null;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    facebook: false,
    linkedin: false,
    lastSyncFacebook: null,
    lastSyncLinkedin: null,
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
        const response = await authApi.getConnections();

        setConnectionStatus({
          facebook: response.data.facebookConnected || false,
          linkedin: response.data.linkedinConnected || false,
          lastSyncFacebook: response.data.lastSyncFacebook || null,
          lastSyncLinkedin: response.data.lastSyncLinkedin || null,
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

  // Get the API base URL based on environment
  const getApiBaseUrl = () => {
    // Use the deployed API URL in production, local in development
    return process.env.NODE_ENV === "production"
      ? "https://marketing-ai-xb6l.vercel.app"
      : "http://localhost:5000";
  };

  // Handle connect to Facebook
  const handleConnectFacebook = () => {
    window.location.href = `${getApiBaseUrl()}/api/social/facebook`;
  };

  // Handle connect to LinkedIn
  const handleConnectLinkedin = () => {
    window.location.href = `${getApiBaseUrl()}/api/social/linkedin`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your social media connections
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Facebook Connection */}
            <div className="flex items-start justify-between flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <Facebook size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Facebook</h3>
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.facebook ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={14} />
                        Not connected
                      </span>
                    )}
                  </p>
                  {connectionStatus.facebook && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last synced:{" "}
                      {formatDate(connectionStatus.lastSyncFacebook)}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant={connectionStatus.facebook ? "outline" : "default"}
                size="sm"
                onClick={handleConnectFacebook}
              >
                {connectionStatus.facebook ? "Reconnect" : "Connect"}
              </Button>
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
                    {connectionStatus.linkedin ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={14} />
                        Not connected
                      </span>
                    )}
                  </p>
                  {connectionStatus.linkedin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last synced:{" "}
                      {formatDate(connectionStatus.lastSyncLinkedin)}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant={connectionStatus.linkedin ? "outline" : "default"}
                size="sm"
                onClick={handleConnectLinkedin}
              >
                {connectionStatus.linkedin ? "Reconnect" : "Connect"}
              </Button>
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

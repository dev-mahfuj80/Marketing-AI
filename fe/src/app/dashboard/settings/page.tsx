"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Facebook,
  Linkedin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  HelpCircle,
  User,
  Mail,
  Edit2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { postsApi } from "@/lib/api";
import { LinkedInPermissions } from "@/components/linkedin/LinkedInPermissions";
import { FacebookPermissions } from "@/components/facebook/FacebookPermissions";
import { useRouter, useSearchParams } from "next/navigation";

interface ConnectionStatus {
  facebook: boolean;
  linkedin: boolean;
  lastSyncFacebook: string | null;
  lastSyncLinkedin: string | null;
  facebookCredentialsValid: boolean;
  linkedinCredentialsValid: boolean;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accounts");
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
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

  // Check URL query parameters for notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Check for LinkedIn connection status
    if (params.has("status")) {
      const status = params.get("status");
      if (status === "success") {
        setNotification({
          show: true,
          type: "success",
          message: "Your social media account has been connected successfully.",
        });
      }
    }

    // Check for errors
    if (params.has("error")) {
      const error = params.get("error");
      const message = params.get("message");

      let errorMessage = "There was an error connecting your account.";

      if (error === "linkedin_oauth_error") {
        errorMessage =
          message ||
          "There was an error connecting your LinkedIn account. Please try again.";
      } else if (error === "missing_code") {
        errorMessage =
          "The authorization code was missing from the response. Please try again or contact support.";
      } else if (message) {
        errorMessage = message;
      }

      setNotification({
        show: true,
        type: "error",
        message: errorMessage,
      });
    }

    // Clean up URL if it has status or error parameters
    if (params.has("status") || params.has("error")) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Auto-hide notification after 5 seconds
    const notificationTimeout = setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);

    return () => clearTimeout(notificationTimeout);
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
          credentialsValid: false,
        };

        try {
          const fbResponse = await fetch("/api/facebook/status");
          if (fbResponse.ok) {
            const fbData = await fbResponse.json();
            facebookStatus = {
              connected: fbData.connected || false,
              lastSync: fbData.lastChecked || null,
              credentialsValid: fbData.credentialsValid || false,
            };
          }
        } catch (error) {
          console.error("Error checking Facebook status:", error);
        }

        // Check LinkedIn connection status
        let linkedinStatus = {
          connected: false,
          lastSync: null,
          credentialsValid: false,
        };

        try {
          const liResponse = await fetch("/api/linkedin/status");
          if (liResponse.ok) {
            const liData = await liResponse.json();
            linkedinStatus = {
              connected: liData.connected || false,
              lastSync: liData.lastChecked || null,
              credentialsValid: liData.credentialsValid || false,
            };
          }
        } catch (error) {
          console.error("Error checking LinkedIn status:", error);
        }

        setConnectionStatus({
          facebook: facebookStatus.connected,
          linkedin: linkedinStatus.connected,
          lastSyncFacebook: facebookStatus.lastSync,
          lastSyncLinkedin: linkedinStatus.lastSync,
          facebookCredentialsValid: facebookStatus.credentialsValid,
          linkedinCredentialsValid: linkedinStatus.credentialsValid,
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

  // Check connection status manually
  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      // Make API calls to check connection status for each platform
      const [fbResponse, liResponse] = await Promise.all([
        fetch("/api/facebook/status"),
        fetch("/api/linkedin/status"),
      ]);

      let facebookStatus = {
        connected: false,
        lastSync: new Date().toISOString(),
        credentialsValid: false,
      };

      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        facebookStatus = {
          connected: fbData.connected || false,
          lastSync: new Date().toISOString(),
          credentialsValid: fbData.credentialsValid || false,
        };
      }

      let linkedinStatus = {
        connected: false,
        lastSync: new Date().toISOString(),
        credentialsValid: false,
      };

      if (liResponse.ok) {
        const liData = await liResponse.json();
        linkedinStatus = {
          connected: liData.connected || false,
          lastSync: new Date().toISOString(),
          credentialsValid: liData.credentialsValid || false,
        };
      }

      setConnectionStatus({
        facebook: facebookStatus.connected,
        linkedin: linkedinStatus.connected,
        lastSyncFacebook: facebookStatus.lastSync,
        lastSyncLinkedin: linkedinStatus.lastSync,
        facebookCredentialsValid: facebookStatus.credentialsValid,
        linkedinCredentialsValid: linkedinStatus.credentialsValid,
      });

      setNotification({
        show: true,
        type: "success",
        message: "Connection status updated successfully.",
      });
    } catch (error) {
      console.error("Error checking connection status:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Error checking connection status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and social media connections.
        </p>
      </div>

      {notification.show && (
        <div
          className={`p-4 mb-4 rounded-md ${
            notification.type === "success"
              ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() =>
                    setNotification((prev) => ({ ...prev, show: false }))
                  }
                  className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Account</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-muted-foreground text-sm mt-1 mb-4">
                  Update your account information and preferences
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Email Address</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {user?.email || "Loading..."}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground italic">
                      (Cannot be changed)
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-sm">Full Name</h3>
                      </div>
                      <p className="text-foreground text-sm">
                        {user?.name || "Loading..."}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7">
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-3">Account Status</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between py-2 border-b border-muted/40">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-full">
                          <Linkedin size={16} />
                        </div>
                        <span>LinkedIn Connection</span>
                      </div>
                      <Badge
                        variant={
                          connectionStatus.linkedinCredentialsValid
                            ? "default"
                            : "destructive"
                        }
                      >
                        {connectionStatus.linkedinCredentialsValid
                          ? "Connected"
                          : "Not Connected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-muted/40">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-800 text-white p-1.5 rounded-full">
                          <Facebook size={16} />
                        </div>
                        <span>Facebook Connection</span>
                      </div>
                      <Badge
                        variant={
                          connectionStatus.facebookCredentialsValid
                            ? "default"
                            : "destructive"
                        }
                      >
                        {connectionStatus.facebookCredentialsValid
                          ? "Connected"
                          : "Not Connected"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={checkConnectionStatus}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Refresh Connection Status
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* LinkedIn Tab */}
        <TabsContent value="linkedin" className="space-y-4">
          <LinkedInPermissions />
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="space-y-4">
          <FacebookPermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}

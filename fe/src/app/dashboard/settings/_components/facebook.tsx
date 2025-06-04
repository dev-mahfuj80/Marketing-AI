"use client";
import { useSocialStore } from "@/lib/store/social-store";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  AlertTriangle,
  Facebook,
  Users,
  Globe,
} from "lucide-react";
import Image from "next/image";

// Define interfaces for the Facebook profile data structure
interface FacebookPicture {
  data: {
    height: number;
    is_silhouette: boolean;
    url: string;
    width: number;
  };
}

interface FacebookPageInfo {
  id: string;
  name: string;
  picture: FacebookPicture;
}

interface FacebookTokenData {
  app_id: string;
  type: string;
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  issued_at: number;
  profile_id: string;
  user_id: string;
  scopes: string[];
}

interface FacebookTokenInfo {
  data: FacebookTokenData;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  is_current_token: boolean;
}

interface FacebookAccessiblePages {
  data: FacebookPage[];
}

interface FacebookProfile {
  message: string;
  connected: boolean;
  credentialsValid: boolean;
  lastChecked: string;
  pageInfo: FacebookPageInfo;
  tokenInfo: FacebookTokenInfo;
  accessiblePages: FacebookAccessiblePages;
}

// Helper function to format dates
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "--";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Invalid date";
  }
}

// Helper function to format timestamps
function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return "--";
  try {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Invalid date";
  }
}

export default function FacebookTab() {
  const facebookProfile = useSocialStore(
    (state) => state.facebookProfile
  ) as FacebookProfile;
  const getFacebookProfileStatus = useSocialStore(
    (state) => state.getFacebookProfileStatus
  );

  useEffect(() => {
    getFacebookProfileStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract commonly used values
  const isConnected = facebookProfile?.connected;
  const isValid = facebookProfile?.credentialsValid;
  const lastChecked = facebookProfile?.lastChecked;
  const profilePictureUrl = facebookProfile?.pageInfo?.picture?.data?.url;

  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Facebook Connection
            </CardTitle>
            {isConnected ? (
              <Badge className="bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-1" /> Not Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            Manage your Facebook page connection and view accessible pages
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="connection">Connection Details</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4 mt-4">
              {/* Profile Info Section */}
              {isConnected && facebookProfile?.pageInfo && (
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-900">
                    <div className="h-full w-full relative">
                      {profilePictureUrl ? (
                        <Image
                          src={profilePictureUrl}
                          alt={facebookProfile.pageInfo.name || "Page Picture"}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-50 dark:bg-blue-900">
                          <Facebook className="h-8 w-8 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xl">
                      {facebookProfile.pageInfo.name || "--"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {facebookProfile.pageInfo.id || "--"}
                    </p>
                    {facebookProfile.tokenInfo?.data && (
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={isValid ? "outline" : "destructive"}
                          className="text-xs"
                        >
                          {isValid ? "Token Valid" : "Token Invalid"}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          Last checked:{" "}
                          {formatDate(facebookProfile.lastChecked)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Facebook Pages List */}
              {facebookProfile?.accessiblePages?.data?.length > 0 ? (
                facebookProfile.accessiblePages.data.map((page, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{page.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {page.id}
                          </p>
                        </div>
                        <Badge>
                          {page.is_current_token ? "Current Token" : "Page"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center text-sm space-x-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>Facebook Page</span>
                        </div>
                        <div className="flex items-center text-sm space-x-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <a
                            href={`https://facebook.com/${page.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View on Facebook
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6">
                  <Facebook className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">
                    No pages available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No Facebook pages are connected to this account.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="connection" className="mt-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Connection Status</span>
                    <span
                      className={
                        isConnected ? "text-green-500" : "text-red-500"
                      }
                    >
                      {isConnected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Token Validity</span>
                    <span
                      className={isValid ? "text-green-500" : "text-red-500"}
                    >
                      {isValid ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Last Checked</span>
                    <span>{formatDate(lastChecked)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Page ID</span>
                    <span className="text-sm font-mono">
                      {facebookProfile?.pageInfo?.id || "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">App ID</span>
                    <span className="text-sm font-mono">
                      {facebookProfile?.tokenInfo?.data?.app_id || "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Token Type</span>
                    <span>
                      {facebookProfile?.tokenInfo?.data?.type || "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Token Issued At</span>
                    <span>
                      {formatTimestamp(
                        facebookProfile?.tokenInfo?.data?.issued_at
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Data Access Expires</span>
                    <span>
                      {formatTimestamp(
                        facebookProfile?.tokenInfo?.data?.data_access_expires_at
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Pages Count</span>
                    <span>
                      {facebookProfile?.accessiblePages?.data?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Scopes Section */}
                {facebookProfile?.tokenInfo?.data?.scopes?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Permissions</h3>
                    <div className="flex flex-wrap gap-1">
                      {facebookProfile.tokenInfo.data.scopes
                        .slice(0, 12)
                        .map((scope, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {scope}
                          </Badge>
                        ))}
                      {facebookProfile.tokenInfo.data.scopes.length > 12 && (
                        <Badge variant="secondary" className="text-xs">
                          +
                          {facebookProfile.tokenInfo.data.scopes.length - 12}{" "}
                          more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => getFacebookProfileStatus()}
                  >
                    Refresh Status
                  </Button>
                  <Button>Reconnect Facebook</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

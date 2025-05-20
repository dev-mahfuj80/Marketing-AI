"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Info, 
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { facebookApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FacebookPermission {
  name: string;
  description: string;
  status: 'granted' | 'missing' | 'unknown';
}

interface FacebookProfile {
  name?: string;
  category?: string;
  picture?: string;
  pageId?: string;
}

interface FacebookPermissionsProps {
  className?: string;
  showCompact?: boolean;
}

export function FacebookPermissions({ className, showCompact = false }: FacebookPermissionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    credentialsValid: false,
    authUrl: '',
    message: '',
    permissionNote: '',
    nextSteps: ''
  });
  const [permissions, setPermissions] = useState<FacebookPermission[]>([]);
  const [profileInfo, setProfileInfo] = useState<FacebookProfile | null>(null);
  const [expandedInfo, setExpandedInfo] = useState(false);

  // Fetch Facebook status and permissions
  useEffect(() => {
    fetchFacebookStatus();
  }, []);

  const fetchFacebookStatus = async () => {
    setIsLoading(true);
    try {
      // Fetch status using our API service
      const response = await facebookApi.checkStatus();
      const data = response.data;
      
      setConnectionStatus({
        connected: !!data.connected,
        credentialsValid: !!data.credentialsValid,
        authUrl: data.authUrl || '',
        message: data.message || '',
        permissionNote: data.permissionNote || '',
        nextSteps: data.nextSteps || ''
      });

      // Check if we have permissions info
      if (data.permissions) {
        setPermissions(data.permissions);
      } else {
        // Set default permissions to check for
        setPermissions([
          {
            name: 'pages_read_engagement',
            description: 'Access posts and metrics for Pages you manage',
            status: data.connected ? 'granted' : 'unknown'
          },
          {
            name: 'pages_manage_posts',
            description: 'Create and manage posts for Pages you manage',
            status: data.connected ? 'granted' : 'unknown'
          },
          {
            name: 'pages_messaging',
            description: 'Message people who follow your Page or interact with your content',
            status: data.connected ? 'granted' : 'unknown'
          }
        ]);
      }

      // Check if we have profile info
      if (data.pageInfo) {
        setProfileInfo(data.pageInfo);
      }
    } catch (error) {
      console.error('Error fetching Facebook status:', error);
      setConnectionStatus(prev => ({
        ...prev,
        connected: false,
        message: 'Error connecting to Facebook API'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // For compact mode shown in dashboard
  if (showCompact && !isLoading) {
    // If not connected, don't show anything in the dashboard per requirements
    if (!connectionStatus.connected) {
      return null;
    }

    // Check if the token has all required permissions
    const missingPermissions = permissions.filter(p => p.status === 'missing');
    
    if (missingPermissions.length > 0) {
      return (
        <Card className={cn("border-amber-200 dark:border-amber-800", className)}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Facebook Permission Issues</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Facebook connection is missing required permissions.
                </p>
                <div className="mt-2 space-y-1">
                  {missingPermissions.map(permission => (
                    <div key={permission.name} className="flex items-center space-x-2">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs">{permission.name}: {permission.description}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    className="h-8"
                    onClick={() => {
                      if (connectionStatus.authUrl) {
                        window.location.href = connectionStatus.authUrl;
                      } else {
                        window.location.href = '/dashboard/settings';
                      }
                    }}
                  >
                    Reconnect with Full Permissions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Connected with all permissions
    return null;
  }

  // Full view for settings page
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1 rounded">
              <Facebook className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Facebook Integration</CardTitle>
          </div>
          {!isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={fetchFacebookStatus}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-xs">Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {connectionStatus.connected ? (
                  <Badge className="bg-green-600">Connected</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Not Connected
                  </Badge>
                )}
                {connectionStatus.credentialsValid && !connectionStatus.connected && (
                  <Badge variant="outline" className="border-blue-300 text-blue-600">
                    API Credentials Valid
                  </Badge>
                )}
              </div>
            </div>

            {/* Connection Status Info */}
            {!connectionStatus.connected && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
                <div className="flex space-x-2">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      {connectionStatus.message || 'Facebook account not connected'}
                    </p>
                    {connectionStatus.permissionNote && (
                      <p className="mt-1 text-amber-700 dark:text-amber-400 text-sm">
                        {connectionStatus.permissionNote}
                      </p>
                    )}
                    {connectionStatus.nextSteps && (
                      <p className="mt-2 text-sm">
                        {connectionStatus.nextSteps}
                      </p>
                    )}
                    {connectionStatus.authUrl && (
                      <Button
                        className="mt-3 h-8"
                        onClick={() => window.location.href = connectionStatus.authUrl}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        Connect Facebook
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information (when connected) */}
            {connectionStatus.connected && profileInfo && (
              <div className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1.5 text-green-600" />
                    <span>Page Information</span>
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setExpandedInfo(!expandedInfo)}
                  >
                    {expandedInfo ? 'Show Less' : 'Show More'}
                  </Button>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-muted-foreground">Page Name:</span>
                    <span className="col-span-2 font-medium">{profileInfo.name || 'Not available'}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="col-span-2">{profileInfo.category || 'Not available'}</span>
                  </div>
                  
                  {expandedInfo && profileInfo.pageId && (
                    <div className="grid grid-cols-3 text-sm">
                      <span className="text-muted-foreground">Facebook URL:</span>
                      <a 
                        href={`https://facebook.com/${profileInfo.pageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 text-blue-600 hover:underline flex items-center"
                      >
                        facebook.com/{profileInfo.pageId}
                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* API Permissions Section */}
            <div className="border rounded-md p-3">
              <h3 className="font-medium text-sm flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                <span>API Permissions</span>
              </h3>
              
              <div className="mt-3 space-y-2.5">
                {permissions.map((permission) => (
                  <div key={permission.name} className="flex items-start">
                    {permission.status === 'granted' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    ) : permission.status === 'missing' ? (
                      <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <HelpCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{permission.name}</div>
                      <div className="text-xs text-muted-foreground">{permission.description}</div>
                    </div>
                  </div>
                ))}

                {/* Show a note about permissions */}
                <div className="pt-2 text-xs text-muted-foreground flex items-start space-x-2">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Facebook requires specific permissions to access different features. 
                    Make sure your app has the necessary permissions in the Facebook Developer Console.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2">
              {connectionStatus.connected ? (
                <Button 
                  variant="outline"
                  className="text-sm"
                  onClick={() => window.location.href = '/dashboard/settings?action=disconnect-facebook'}
                >
                  Disconnect Page
                </Button>
              ) : connectionStatus.authUrl ? (
                <Button
                  onClick={() => window.location.href = connectionStatus.authUrl}
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Connect Facebook
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled className="w-full">
                    API Configuration Required
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator to set up Facebook API credentials
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

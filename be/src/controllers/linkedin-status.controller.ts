import { Request, Response } from "express";
import { LinkedInService } from "../services/linkedin.service.js";
import { env } from "../config/env.js";
import axios from "axios";

/**
 * Controller for checking LinkedIn connection status and permissions
 */
export class LinkedInStatusController {
  private linkedinService: LinkedInService;

  constructor() {
    this.linkedinService = new LinkedInService();
    // Bind 'this' context to methods to prevent 'this' from being lost
    this.checkStatus = this.checkStatus.bind(this);
  }

  /**
   * Check LinkedIn connection status and available permissions
   */
  async checkStatus(req: Request, res: Response) {
    try {
      // First check if LinkedIn credentials are configured
      if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
        return res.status(200).json({
          connected: false,
          credentialsValid: false,
          message: "LinkedIn API credentials are not configured",
          lastChecked: new Date().toISOString(),
          permissionNote: "Please add LinkedIn client ID and secret to your environment variables",
          nextSteps: "Contact your administrator to set up LinkedIn API credentials"
        });
      }

      // Test the credentials by attempting to get a token
      let credentialsValid = false;
      try {
        // Make sure linkedinService is initialized
        if (!this.linkedinService) {
          this.linkedinService = new LinkedInService();
        }
        await this.linkedinService.testCredentials();
        credentialsValid = true;
      } catch (error) {
        console.error("LinkedIn credentials test failed:", error);
      }

      // Check if we have a direct access token
      let tokenStatus = {
        valid: false,
        scopes: [] as string[]
      };

      if (env.LINKEDIN_ACCESS_TOKEN) {
        try {
          // Create LinkedIn service instance if it doesn't exist
          if (!this.linkedinService) {
            this.linkedinService = new LinkedInService();
          }
          // Validate the token and check for permissions
          tokenStatus.valid = await this.linkedinService.validateAccessToken(env.LINKEDIN_ACCESS_TOKEN);
          
          // If we have a valid token, attempt to get org info to check permissions directly
          if (tokenStatus.valid) {
            try {
              const organizationResponse = await axios.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', {
                headers: {
                  'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
                  'X-Restli-Protocol-Version': '2.0.0',
                  'LinkedIn-Version': 'v2'
                }
              });
              
              // Get the organization ID from the response
              if (organizationResponse.data && 
                  organizationResponse.data.elements && 
                  organizationResponse.data.elements.length > 0) {
                
                const organizationId = organizationResponse.data.elements[0].organizationalTarget.split(':').pop();
                
                // Get organization details
                const orgDetailsResponse = await axios.get(
                  `https://api.linkedin.com/v2/organizations/${organizationId}`, {
                    headers: {
                      'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
                      'X-Restli-Protocol-Version': '2.0.0',
                      'LinkedIn-Version': 'v2'
                    }
                  }
                );
                
                const orgInfo = orgDetailsResponse.data;
                
                return res.status(200).json({
                  connected: true,
                  credentialsValid,
                  lastChecked: new Date().toISOString(),
                  orgInfo: {
                    name: orgInfo.localizedName || orgInfo.vanityName || 'LinkedIn Organization',
                    id: orgInfo.id || organizationId,
                    logoUrl: orgInfo.logoV2?.original || null,
                    description: orgInfo.localizedDescription || null
                  },
                  permissions: [
                    {
                      name: "r_organization_social",
                      description: "Read organization social posts and metrics",
                      status: "granted"
                    },
                    {
                      name: "w_organization_social",
                      description: "Create and manage organization social posts",
                      status: "granted"
                    },
                    {
                      name: "rw_organization_admin",
                      description: "Manage organization page administration",
                      status: "granted"
                    }
                  ]
                });
              }
            } catch (orgError) {
              console.error("Error getting LinkedIn organization info:", orgError);
              // Continue to fallback response below, as we know token is valid but can't get org details
            }
          }
        } catch (error) {
          console.error("LinkedIn token validation failed:", error);
        }
      }

      // If we couldn't validate a specific token or get org info, let's check for specific permissions
      let availablePermissions = [];
      let permissionDetails = {};
      
      // Check for specific permissions if we have a valid token
      if (tokenStatus.valid && env.LINKEDIN_ACCESS_TOKEN) {
        // Check basic profile access
        try {
          const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
              'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          if (profileResponse.status === 200) {
            availablePermissions.push('r_liteprofile');
            permissionDetails['r_liteprofile'] = {
              name: "r_liteprofile",
              description: "Read basic profile information",
              status: "granted"
            };
          }
        } catch (profileError) {
          console.warn("LinkedIn profile access check failed:", profileError);
          permissionDetails['r_liteprofile'] = {
            name: "r_liteprofile",
            description: "Read basic profile information",
            status: "missing"
          };
        }
        
        // Check email access
        try {
          const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: {
              'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          if (emailResponse.status === 200) {
            availablePermissions.push('r_emailaddress');
            permissionDetails['r_emailaddress'] = {
              name: "r_emailaddress",
              description: "Read email address",
              status: "granted"
            };
          }
        } catch (emailError) {
          console.warn("LinkedIn email access check failed:", emailError);
          permissionDetails['r_emailaddress'] = {
            name: "r_emailaddress",
            description: "Read email address",
            status: "missing"
          };
        }
        
        // Check organization post access
        try {
          const orgPostsResponse = await axios.get('https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Aorganization%3A123)&count=1', {
            headers: {
              'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          if (orgPostsResponse.status === 200) {
            availablePermissions.push('r_organization_social');
            permissionDetails['r_organization_social'] = {
              name: "r_organization_social",
              description: "Read organization social posts",
              status: "granted"
            };
          }
        } catch (orgPostsError) {
          console.warn("LinkedIn org posts access check failed:", orgPostsError);
          permissionDetails['r_organization_social'] = {
            name: "r_organization_social",
            description: "Read organization social posts",
            status: "missing"
          };
        }
        
        // Check write organization social permission
        try {
          // We can't actually test posting, but check if the API accepts a draft request
          const testPayload = {
            author: "urn:li:organization:123",
            lifecycleState: "DRAFT",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: "Test draft post"
                },
                shareMediaCategory: "NONE"
              }
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
          };
          
          const orgWriteResponse = await axios.post('https://api.linkedin.com/v2/ugcPosts', testPayload, {
            headers: {
              'Authorization': `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'Content-Type': 'application/json'
            }
          });
          
          if (orgWriteResponse.status === 201 || orgWriteResponse.status === 200) {
            availablePermissions.push('w_organization_social');
            permissionDetails['w_organization_social'] = {
              name: "w_organization_social",
              description: "Create and manage organization social posts",
              status: "granted"
            };
          }
        } catch (orgWriteError) {
          // If it fails with a 403, it's a permissions issue
          const isPermissionIssue = orgWriteError.response?.status === 403;
          
          permissionDetails['w_organization_social'] = {
            name: "w_organization_social",
            description: "Create and manage organization social posts",
            status: isPermissionIssue ? "missing" : "unknown"
          };
        }
      }
      
      // Format permissions for response
      const permissionsList = Object.values(permissionDetails).length > 0 ? 
        Object.values(permissionDetails) : 
        [
          {
            name: "r_organization_social",
            description: "Read organization social posts and metrics",
            status: tokenStatus.valid ? "unknown" : "missing"
          },
          {
            name: "w_organization_social",
            description: "Create and manage organization social posts",
            status: tokenStatus.valid ? "unknown" : "missing"
          },
          {
            name: "r_liteprofile",
            description: "Read basic profile information",
            status: tokenStatus.valid ? "unknown" : "missing"
          },
          {
            name: "r_emailaddress",
            description: "Read email address",
            status: tokenStatus.valid ? "unknown" : "missing"
          }
        ];
      
      // Determine if we have enough permissions for posts
      const hasPostPermissions = availablePermissions.includes('r_organization_social');
      
      return res.status(200).json({
        connected: tokenStatus.valid,
        credentialsValid,
        hasPostPermissions,
        lastChecked: new Date().toISOString(),
        message: tokenStatus.valid 
          ? "LinkedIn connection active" 
          : "LinkedIn connection inactive",
        permissionNote: credentialsValid && !tokenStatus.valid
          ? "Your LinkedIn API credentials are valid, but the access token is missing or invalid"
          : "LinkedIn integration requires valid credentials and an access token with the proper permissions",
        nextSteps: credentialsValid && !tokenStatus.valid
          ? "Generate a new access token with proper permissions"
          : "Update your LinkedIn API credentials in the environment settings",
        authUrl: credentialsValid 
          ? `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.LINKEDIN_REDIRECT_URI)}&scope=r_liteprofile%20r_emailaddress%20r_organization_social%20w_organization_social%20rw_organization_admin` 
          : null,
        permissions: permissionsList
      });
    } catch (error) {
      console.error("Error checking LinkedIn status:", error);
      return res.status(500).json({
        connected: false,
        credentialsValid: false,
        message: "Error checking LinkedIn status",
        lastChecked: new Date().toISOString(),
        error: (error as Error).message
      });
    }
  }
}

// Export controller instance
export const linkedInStatusController = new LinkedInStatusController();

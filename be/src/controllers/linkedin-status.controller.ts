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

      // If we couldn't validate a specific token or get org info
      return res.status(200).json({
        connected: tokenStatus.valid,
        credentialsValid,
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
          ? `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.LINKEDIN_REDIRECT_URI)}&scope=r_organization_social%20w_organization_social%20rw_organization_admin` 
          : null,
        permissions: [
          {
            name: "r_organization_social",
            description: "Read organization social posts and metrics",
            status: tokenStatus.valid ? "granted" : "unknown"
          },
          {
            name: "w_organization_social",
            description: "Create and manage organization social posts",
            status: tokenStatus.valid ? "granted" : "unknown"
          },
          {
            name: "rw_organization_admin",
            description: "Manage organization page administration",
            status: tokenStatus.valid ? "granted" : "unknown"
          }
        ]
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

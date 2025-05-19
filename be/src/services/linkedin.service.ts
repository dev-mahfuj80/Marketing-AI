import axios from 'axios';
import { env } from '../config/env.js';
import FormData from 'form-data';
import fs from 'fs';

// Add detailed logging for troubleshooting
const DEBUG = true;
const debug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[LinkedIn Service] ${message}`, data || '');
  }
};

/**
 * LinkedIn API service using client ID and secret directly
 */
export class LinkedInService {
  // LinkedIn API versions
  private authApiVersion = 'v2'; // For auth endpoints
  private marketingApiVersion = 'v2'; // Marketing API for posts

  /**
   * Get posts from LinkedIn using client credentials
   * @param limit Number of posts to retrieve
   */
  async getPosts(limit = 10) {
    try {
      debug('Getting LinkedIn posts, limit:', limit);
      // Using client credentials OAuth flow for LinkedIn API
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;
      debug('Received access token', { token_prefix: accessToken.substring(0, 10) + '...' });
      
      // Get organization info - with client credentials we need to use organization APIs
      // First, get the organization ID associated with the current credentials
      const orgResponse = await this.getOrganizationInfo(accessToken);
      
      if (!orgResponse || !orgResponse.organization) {
        throw new Error('Could not retrieve organization information for LinkedIn account');
      }
      
      const orgId = orgResponse.organization;
      debug('Using organization', { orgId });
      
      // Get posts using LinkedIn Marketing API - for organizations we use ugcPosts
      const response = await axios.get(
        `https://api.linkedin.com/rest/posts?q=author&author=${encodeURIComponent(orgId)}&count=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': this.marketingApiVersion,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );
      
      debug('LinkedIn posts response', { status: response.status });
      
      // If no actual posts data, return a default structure
      if (!response.data || !response.data.elements) {
        return {
          data: { elements: [] },
          paging: { count: 0, start: 0, total: 0 },
          elements: [],
        };
      }
      
      return {
        data: response.data,
        paging: response.data.paging || { count: 0, start: 0, total: 0 },
        elements: response.data.elements || [],
      };
    } catch (error) {
      console.error('Error fetching LinkedIn posts:', error);
      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error('LinkedIn API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch LinkedIn posts: ${errorMessage}`);
    }
  }
  
  /**
   * Get organization information for the authenticated account
   * @param accessToken LinkedIn access token
   */
  private async getOrganizationInfo(accessToken: string) {
    try {
      debug('Getting organization info');
      
      // First try to get the organization using the /organizationalEntityAcls endpoint
      const aclResponse = await axios.get(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          }
        }
      );
      
      // Extract the organization URN from the response
      if (aclResponse.data && 
          aclResponse.data.elements && 
          aclResponse.data.elements.length > 0 &&
          aclResponse.data.elements[0].organizationalTarget) {
        
        const orgUrn = aclResponse.data.elements[0].organizationalTarget;
        debug('Found organization from ACLs', { orgUrn });
        return { organization: orgUrn };
      }
      
      // Fallback to getting the person profile and finding their organizations
      const meResponse = await axios.get(
        `https://api.linkedin.com/v2/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      
      const personId = meResponse.data.id;
      debug('Found person ID', { personId });
      
      // Use the person ID to create a default organization URN
      return { organization: `urn:li:person:${personId}` };
    } catch (error) {
      console.error('Error getting LinkedIn organization info:', error);
      // Provide a fallback method - use the client ID as a basis for a URN
      const fallbackUrn = `urn:li:organization:${env.LINKEDIN_CLIENT_ID.substring(0, 8)}`;
      debug('Using fallback organization URN', { fallbackUrn });
      
      return { organization: fallbackUrn };
    }
  }

  /**
   * Publish a post to LinkedIn
   * @param message Message content for the post
   * @param imageUrl Optional image URL to include in the post
   * @param link Optional link to include in the post
   */
  async publishPost(message: string, imageUrl?: string, link?: string) {
    try {
      debug('Publishing LinkedIn post', { hasImage: !!imageUrl, hasLink: !!link });
      
      // Get access token first
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;
      debug('Received access token', { token_prefix: accessToken.substring(0, 10) + '...' });
      
      // Get organization info
      const orgResponse = await this.getOrganizationInfo(accessToken);
      const authorUrn = orgResponse.organization;
      debug('Using author', { authorUrn });

      // Prepare post content using UGC Post API
      // LinkedIn's newer API uses a different format than the old /shares endpoint
      let postData: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: message
            },
            shareMediaCategory: 'NONE',
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add link if provided
      if (link) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: 'Article description'
            },
            originalUrl: link,
            title: {
              text: 'Shared Link'
            }
          }
        ];
      }
      // Add image if provided and no link (can't have both in one post)
      else if (imageUrl) {
        // For images, we need to register the image first, then create the post
        // This is a complex process and would require multiple API calls
        // For simplicity, we'll just include the image URL as a link for now
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: 'Image'
            },
            originalUrl: imageUrl,
            title: {
              text: 'Image Post'
            }
          }
        ];
      }

      debug('LinkedIn post data', postData);
      
      // Publish post to LinkedIn using the UGC Post API
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );
      
      debug('LinkedIn post created', { postId: response.data.id });

      return {
        id: response.data.id,
        permalink: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      console.error('Error publishing LinkedIn post:', error);
      
      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error('LinkedIn API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to publish LinkedIn post: ${errorMessage}`);
    }
  }

  /**
   * Get LinkedIn access token using client credentials
   * @private
   */
  private async getAccessToken() {
    try {
      debug('Getting LinkedIn access token');
      
      // Need to use URLSearchParams for proper x-www-form-urlencoded format
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', env.LINKEDIN_CLIENT_ID);
      params.append('client_secret', env.LINKEDIN_CLIENT_SECRET);
      
      // Need to specify scope for the Marketing API
      params.append('scope', 'r_organization_social rw_organization_admin w_member_social r_member_social');
      
      debug('Token request parameters', {
        grant_type: 'client_credentials',
        client_id_prefix: env.LINKEDIN_CLIENT_ID?.substring(0, 5) + '...',
        client_secret_prefix: env.LINKEDIN_CLIENT_SECRET?.substring(0, 5) + '...',
      });
      
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      debug('Token response received', {
        expires_in: tokenResponse.data.expires_in,
        has_token: !!tokenResponse.data.access_token,
      });

      return tokenResponse.data;
    } catch (error) {
      console.error('Error getting LinkedIn access token:', error);
      
      // Log more details for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error('LinkedIn token error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get LinkedIn access token: ${errorMessage}`);
    }
  }
}

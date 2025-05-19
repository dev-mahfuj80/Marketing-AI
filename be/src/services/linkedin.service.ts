import axios from 'axios';
import { env } from '../config/env.js';

/**
 * LinkedIn API service using client ID and secret directly
 */
export class LinkedInService {
  private apiVersion = 'v2'; // Current LinkedIn API version

  /**
   * Get posts from LinkedIn using client credentials
   * @param limit Number of posts to retrieve
   */
  async getPosts(limit = 10) {
    try {
      // Using client credentials OAuth flow for LinkedIn API
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;

      // Get user info to get the personURN
      const profileResponse = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const personURN = profileResponse.data.id;

      // Get posts using the LinkedIn API
      // Note: LinkedIn API doesn't have a direct endpoint to get a user's posts,
      // so we're using the shares API to get the recent shares by the user
      const response = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/shares?q=owners&owners=${encodeURIComponent(`urn:li:person:${personURN}`)}&count=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        data: response.data,
        paging: response.data.paging,
        elements: response.data.elements,
      };
    } catch (error) {
      console.error('Error fetching LinkedIn posts:', error);
      throw new Error('Failed to fetch LinkedIn posts');
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
      // Get access token first
      const tokenResponse = await this.getAccessToken();
      const accessToken = tokenResponse.access_token;

      // Get user info to get the personURN
      const profileResponse = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const personURN = profileResponse.data.id;

      // Prepare post content
      const postData: any = {
        owner: `urn:li:person:${personURN}`,
        text: {
          text: message,
        },
      };

      // Add image if provided
      if (imageUrl) {
        postData.content = {
          contentEntities: [
            {
              entityLocation: imageUrl,
              thumbnails: [
                {
                  resolvedUrl: imageUrl,
                },
              ],
            },
          ],
          title: 'Image Post',
        };
      }
      // Add link if provided (will override image if both are provided)
      else if (link) {
        postData.content = {
          contentEntities: [
            {
              entityLocation: link,
              thumbnails: [
                {
                  resolvedUrl: link,
                },
              ],
            },
          ],
          title: 'Shared Link',
        };
      }

      // Publish post to LinkedIn
      const response = await axios.post(
        `https://api.linkedin.com/${this.apiVersion}/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.id,
        permalink: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      console.error('Error publishing LinkedIn post:', error);
      throw new Error('Failed to publish LinkedIn post');
    }
  }

  /**
   * Get LinkedIn access token using client credentials
   * @private
   */
  private async getAccessToken() {
    try {
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: env.LINKEDIN_CLIENT_ID,
            client_secret: env.LINKEDIN_CLIENT_SECRET,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return tokenResponse.data;
    } catch (error) {
      console.error('Error getting LinkedIn access token:', error);
      throw new Error('Failed to get LinkedIn access token');
    }
  }
}

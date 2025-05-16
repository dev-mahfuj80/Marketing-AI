import axios from 'axios';
import { env } from '../config/env.js';

/**
 * Simplified Facebook API service using page access token directly
 */
export class FacebookService {
  private apiVersion = 'v19.0'; // Current Facebook Graph API version

  /**
   * Get page posts using page access token
   * @param pageId ID of the Facebook page
   * @param pageAccessToken Access token for the page
   * @param limit Number of posts to retrieve
   */
  async getPagePosts(pageId: string, pageAccessToken: string, limit = 10) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${pageId}/posts`,
        {
          params: {
            fields: 'id,message,created_time,attachments,permalink_url,full_picture',
            limit,
            access_token: pageAccessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Facebook page posts:', error);
      throw new Error('Failed to fetch Facebook page posts');
    }
  }

  /**
   * Publish a post to a Facebook page
   * @param pageId ID of the Facebook page
   * @param pageAccessToken Access token for the page
   * @param message Message content for the post
   * @param link Optional link to include in the post
   */
  async publishPagePost(
    pageId: string, 
    pageAccessToken: string, 
    message: string, 
    link?: string
  ) {
    try {
      const postData: any = { message };
      if (link) {
        postData.link = link;
      }

      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${pageId}/feed`,
        postData,
        {
          params: {
            access_token: pageAccessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error publishing Facebook post:', error);
      throw new Error('Failed to publish Facebook post');
    }
  }
}

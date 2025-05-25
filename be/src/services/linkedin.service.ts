import axios from "axios";

/**
 * LinkedIn Service - handles LinkedIn API interactions
 */
export class LinkedInService {
  private apiVersion: string = "v2";

  /**
   * Check LinkedIn access token validity
   */
  async checkAccessToken(accessToken: string) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0"
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking LinkedIn access token:", error);
      throw error;
    }
  }

  /**
   * Get user's LinkedIn posts
   */
  async getPosts(accessToken: string, limit = 10) {
    try {
      console.log("LinkedIn: Starting to fetch posts with token", accessToken.substring(0, 15) + "...");
      
      // Use the exact organization ID from the working Postman URL
      const organizationId = "102063139";
      
      // IMPORTANT: DO NOT use urn:li:organization: format - use exactly what works in Postman
      // The user's working Postman URL uses owners=urn%3Ali%3Aorganization%3A102063139
      // So we'll construct the exact same URL without any modifications
      const exactUrl = `https://api.linkedin.com/${this.apiVersion}/shares?count=${limit}&owners=urn%3Ali%3Aorganization%3A102063139&q=owners&start=10`;
      
      console.log("LinkedIn: Using exact Postman URL format:", exactUrl);
      
      const response = await axios.get(exactUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });
      
      console.log("LinkedIn: API response status:", response.status);
      
      if (response.data && response.data.elements && response.data.elements.length > 0) {
        console.log(`LinkedIn: Found ${response.data.elements.length} posts`);
        return response.data;
      } else {
        console.log("LinkedIn: API returned empty results");
        return { elements: [] };
      }
    } catch (error) {
      console.error("Error fetching LinkedIn posts:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      // Return an empty response instead of throwing to avoid frontend errors
      return { elements: [] };
    }
  }

  /**
   * Publish a post to LinkedIn
   */
  async publishPost(accessToken: string, text: string, imageUrl?: string, articleUrl?: string) {
    try {
      console.log("LinkedIn: Publishing post");
      
      // First get the user profile to get the URN
      const profileResponse = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0"
          },
        }
      );

      const personId = profileResponse.data.id;
      const personUrn = `urn:li:person:${personId}`;

      // Build the post payload
      const postPayload: Record<string, unknown> = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      // Add media if provided
      if (imageUrl || articleUrl) {
        // Type assertion to safely access ShareContent
        (postPayload.specificContent as any)["com.linkedin.ugc.ShareContent"].shareMediaCategory = "ARTICLE";
        
        // Type assertion for ShareContent
        (postPayload.specificContent as any)["com.linkedin.ugc.ShareContent"].media = [
          {
            status: "READY",
            originalUrl: articleUrl || imageUrl,
            title: articleUrl ? "Shared Article" : "Shared Image",
          },
        ];
      }

      // Post to LinkedIn
      console.log("LinkedIn: Publishing post with payload:", JSON.stringify(postPayload, null, 2));
      
      const response = await axios.post(
        `https://api.linkedin.com/${this.apiVersion}/ugcPosts`,
        postPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      console.log("LinkedIn: Post published successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error publishing LinkedIn post:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  }

  /**
   * Get basic profile information
   */
  async getProfileInfo(accessToken: string) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0"
          },
        }
      );
      
      // Process the response to get a simpler format
      const profile = response.data;
      const firstName = profile.firstName?.localized?.en_US || "";
      const lastName = profile.lastName?.localized?.en_US || "";
      
      // Get profile picture if available
      let profilePicture = null;
      if (profile.profilePicture && 
          profile.profilePicture["displayImage~"] && 
          profile.profilePicture["displayImage~"].elements && 
          profile.profilePicture["displayImage~"].elements.length > 0) {
        profilePicture = profile.profilePicture["displayImage~"].elements[0].identifiers[0].identifier;
      }
      
      return {
        id: profile.id,
        name: `${firstName} ${lastName}`.trim(),
        profilePicture,
      };
    } catch (error) {
      console.error("Error getting LinkedIn profile info:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("LinkedIn API error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  }
}

// Export singleton instance
export const linkedInService = new LinkedInService();

import axios from "axios";


export class LinkedInService {
  private apiVersion: string = "v2";

 
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

  async getPosts(accessToken: string, limit = 10) {
    try {
      const exactUrl = `https://api.linkedin.com/v2/shares?owners=urn:li:organization:102063139&q=owners&start=10&count=10`;
      
      const response = await axios.get(exactUrl, {
        headers: {
          // need client id and secret also
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      if (response.data && response.data.elements && response.data.elements.length > 0) {
        return response.data;
      } else {
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

  async publishPost(accessToken: string, text: string, imageUrl?: string, articleUrl?: string) {
    try {
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

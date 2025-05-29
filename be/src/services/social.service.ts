import axios from "axios";
import FormData from "form-data";

export class LinkedInService {
  private apiVersion: string = "v2";

  async getLinkedInProfileStatus(accessToken: string) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      // Process the response to get a simpler format
      const profile = response.data;
      const firstName = profile.firstName?.localized?.en_US || "";
      const lastName = profile.lastName?.localized?.en_US || "";

      // Get profile picture if available
      let profilePicture = null;
      if (
        profile.profilePicture &&
        profile.profilePicture["displayImage~"] &&
        profile.profilePicture["displayImage~"].elements &&
        profile.profilePicture["displayImage~"].elements.length > 0
      ) {
        profilePicture =
          profile.profilePicture["displayImage~"].elements[0].identifiers[0]
            .identifier;
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
          data: error.response.data,
        });
      }
      throw error;
    }
  }

  async getPosts(accessToken: string, start = 0, count = 10) {
    try {
      console.log("Fetching LinkedIn posts...");
      const exactUrl = `https://api.linkedin.com/v2/shares?owners=urn:li:organization:102063139&q=owners&start=${start}&count=${count}`;

      const response = await axios.get(exactUrl, {
        headers: {
          // need client id and secret also
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (
        response.data &&
        response.data.elements &&
        response.data.elements.length > 0
      ) {
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
          data: error.response.data,
        });
      }
      // Return an empty response instead of throwing to avoid frontend errors
      return { elements: [] };
    }
  }
}

export class FacebookService {
  private apiVersion = "v19.0"; // Current Facebook Graph API version

  async getPagePosts(pageId: string, pageAccessToken: string, limit = 10) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${pageId}/posts`,
        {
          params: {
            fields:
              "id,message,created_time,attachments,permalink_url,full_picture,picture",
            limit,
            access_token: pageAccessToken,
          },
        }
      );

      // Process the response to ensure images are properly included
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map((post: any) => {
          // Make sure full_picture is included
          if (!post.full_picture && post.picture) {
            post.full_picture = post.picture;
          }
          return post;
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching Facebook page posts:", error);
      throw new Error("Failed to fetch Facebook page posts");
    }
  }

  async getFacebookProfileStatus(accessToken: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/me?fields=id,name,picture`,
        {
          params: {
            access_token: accessToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Facebook profile info:", error);
      throw new Error("Failed to get Facebook profile info");
    }
  }
}

// Export instances of services
export const linkedInService = new LinkedInService();
export const facebookService = new FacebookService();

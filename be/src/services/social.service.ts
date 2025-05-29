import axios from "axios";
import FormData from "form-data";

export class LinkedInService {
  private apiVersion: string = "v2";

  async checkAccessToken(accessToken: string) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking LinkedIn access token:", error);
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

  async publishPost(
    accessToken: string,
    text: string,
    imageUrl?: string,
    articleUrl?: string
  ) {
    try {
      // First get the user profile to get the URN
      const profileResponse = await axios.get(
        `https://api.linkedin.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
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
        (postPayload.specificContent as any)[
          "com.linkedin.ugc.ShareContent"
        ].shareMediaCategory = "ARTICLE";

        // Type assertion for ShareContent
        (postPayload.specificContent as any)[
          "com.linkedin.ugc.ShareContent"
        ].media = [
          {
            status: "READY",
            originalUrl: articleUrl || imageUrl,
            title: articleUrl ? "Shared Article" : "Shared Image",
          },
        ];
      }

      // Post to LinkedIn
      console.log(
        "LinkedIn: Publishing post with payload:",
        JSON.stringify(postPayload, null, 2)
      );

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
          data: error.response.data,
        });
      }
      throw error;
    }
  }

  async getLinkedInPInfo(accessToken: string) {
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

  async publishPagePost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    link?: string,
    imageBuffer?: Buffer
  ) {
    try {
      // If we have an image buffer, we need to use the photos edge instead of feed
      if (imageBuffer) {
        // Create FormData for multipart upload
        const form = new FormData();
        form.append("access_token", pageAccessToken);
        form.append("caption", message); // Caption is used for photos instead of message
        form.append("source", imageBuffer, {
          filename: "photo.jpg",
          contentType: "image/jpeg",
        });

        // Use photos endpoint for image uploads
        const response = await axios.post(
          `https://graph.facebook.com/${this.apiVersion}/${pageId}/photos`,
          form,
          {
            headers: { ...form.getHeaders() },
          }
        );

        return response.data;
      } else {
        // No image, use regular feed endpoint
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
      }
    } catch (error) {
      console.error("Error publishing Facebook post:", error);
      throw new Error("Failed to publish Facebook post");
    }
  }
}

// Export instances of services
export const linkedInService = new LinkedInService();
export const facebookService = new FacebookService();

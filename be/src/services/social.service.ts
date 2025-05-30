import axios from "axios";
import FormData from "form-data";

export class LinkedInService {
  // Use v2 API version
  private apiVersion: string = "v2";
  private apiBaseUrl: string = "https://api.linkedin.com";

  private getAuthHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      // Version header is important for LinkedIn API
      "LinkedIn-Version": this.apiVersion,
    };
  }

  async createPost(accessToken: string, text: string, image?: Buffer) {
    try {
      if (!accessToken) {
        throw new Error("LinkedIn access token is required");
      }

      // Try to create a text-only post first to simplify troubleshooting
      // This helps us test if the access token and organization ID are working

      // For LinkedIn, we need to try a person URN first if organization posting fails
      let postAsOrganization = true;
      let personId = null;

      try {
        // First, verify the current user profile to get their ID
        console.log("Getting current LinkedIn user profile...");
        const profileResponse = await axios.get(
          "https://api.linkedin.com/v2/me",
          { headers: this.getAuthHeaders(accessToken) }
        );
        personId = profileResponse.data.id;
        console.log(`LinkedIn profile ID: ${personId}`);
      } catch (profileError) {
        console.error("Could not get LinkedIn profile:", profileError);
      }

      // Now try to get organization info if we have an org ID in env
      const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;
      if (!organizationId) {
        console.log("No organization ID provided, will post as person");
        postAsOrganization = false;
      } else {
        console.log(`Using LinkedIn Organization ID: ${organizationId}`);
        // Verify if the user has access to the organization
        try {
          const orgResponse = await axios.get(
            `https://api.linkedin.com/v2/organizations/${organizationId}`,
            { headers: this.getAuthHeaders(accessToken) }
          );
          console.log("Organization verified:", orgResponse.data.localizedName);
        } catch (orgError) {
          console.error("Could not verify organization access:", orgError);
          console.log("Will attempt to post as person instead");
          postAsOrganization = false;
        }
      }

      // Set the author string based on whether we're posting as org or person
      const authorString = postAsOrganization
        ? `urn:li:organization:${organizationId}`
        : `urn:li:person:${personId}`;

      console.log(`Posting as: ${authorString}`);
      console.log(`Text length: ${text.length}`);
      console.log(`Image provided: ${!!image}`);

      // Add a timestamp to make each post unique
      const uniqueText = `${text}\n\nPosted at: ${new Date().toISOString()}`;

      // Create a text-only post first
      if (!image) {
        console.log("Creating text-only post");

        const postData = {
          author: authorString,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: uniqueText,
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        };

        console.log("Text post payload:", JSON.stringify(postData, null, 2));

        const response = await axios.post(
          `${this.apiBaseUrl}/v2/ugcPosts`,
          postData,
          {
            headers: this.getAuthHeaders(accessToken),
          }
        );

        console.log("Text post created successfully:", response.data);
        return response.data;
      }

      // For image posts, create a simple share with text first
      // This confirms our base functionality works before trying the more complex image upload
      console.log("Creating a post with image...");
      console.log("Step 1: Registering image upload");

      try {
        // Register the upload
        const registerUploadRequest = {
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: authorString,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        };

        console.log(
          "Register upload request:",
          JSON.stringify(registerUploadRequest, null, 2)
        );

        const registerResponse = await axios({
          method: "post",
          url: `${this.apiBaseUrl}/v2/assets?action=registerUpload`,
          headers: this.getAuthHeaders(accessToken),
          data: registerUploadRequest,
        });

        console.log(
          "Register response:",
          JSON.stringify(registerResponse.data, null, 2)
        );

        console.log(
          "Register response:",
          JSON.stringify(registerResponse.data, null, 2)
        );

        // Check for the upload URL in the new response format
        const uploadUrl =
          registerResponse.data?.value?.uploadMechanism?.[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
          ]?.uploadUrl;
        const asset = registerResponse.data?.value?.asset;

        if (!uploadUrl || !asset) {
          console.error(
            "Could not get upload URL or asset from LinkedIn response:",
            registerResponse.data
          );
          throw new Error("Could not get upload URL or asset from LinkedIn");
        }

        console.log(`Upload URL: ${uploadUrl}`);
        console.log(`Asset URN: ${asset}`);

        // Upload the image
        console.log(`Step 2: Uploading image to ${uploadUrl}`);

        const uploadResponse = await axios({
          method: "put",
          url: uploadUrl,
          headers: {
            "Content-Type": "image/png", // or "image/jpeg" based on your image type
            "x-li-format": "json",
          },
          data: image,
          maxContentLength: 10 * 1024 * 1024, // 10MB
          maxBodyLength: 10 * 1024 * 1024, // 10MB
        });

        console.log(`Upload status code: ${uploadResponse.status}`);

        // Create post with the image
        console.log("Step 3: Creating post with uploaded image");

        const postData = {
          author: authorString,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: uniqueText,
              },
              shareMediaCategory: "IMAGE",
              media: [
                {
                  status: "READY",
                  description: {
                    text: uniqueText.substring(0, 200),
                  },
                  media: asset,
                  title: {
                    text: "Post Image",
                  },
                },
              ],
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        };

        console.log(
          "Post with image payload:",
          JSON.stringify(postData, null, 2)
        );

        const response = await axios.post(
          `${this.apiBaseUrl}/v2/ugcPosts`,
          postData,
          {
            headers: {
              ...this.getAuthHeaders(accessToken),
              "X-Restli-Protocol-Version": "2.0.0",
            },
          }
        );

        console.log("Post created successfully:", response.data);
        return response.data;
      } catch (imageError) {
        console.error("Error with image upload process:", imageError);

        // If image upload fails, fall back to text-only post
        console.log("Falling back to text-only post");

        const fallbackPostData = {
          author: authorString,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: uniqueText + "\n\n(Image could not be uploaded)",
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        };

        const fallbackResponse = await axios.post(
          `${this.apiBaseUrl}/v2/ugcPosts`,
          fallbackPostData,
          { headers: this.getAuthHeaders(accessToken) }
        );

        console.log("Fallback text post created:", fallbackResponse.data);
        return fallbackResponse.data;
      }
    } catch (error) {
      console.error("Error creating LinkedIn post:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "LinkedIn API error details:",
          JSON.stringify(error.response.data, null, 2)
        );
      }
      throw error;
    }
  }

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

  async createPost(
    pageId: string,
    pageAccessToken: string,
    message: string,
    image?: Buffer
  ) {
    try {
      console.log("Creating Facebook post with message:", message);
      console.log("Image provided:", !!image);

      // Generate a unique identifier to avoid duplicate posts
      const timestamp = new Date().toISOString();
      const postMessage = `${message}\n\nPosted at: ${timestamp}`;

      // If there's an image, we need to first upload the image, then create a post with it
      if (image) {
        // Step 1: Upload the photo first without publishing
        const uploadFormData = new FormData();
        uploadFormData.append("source", image, {
          filename: `post-image-${Date.now()}.jpg`,
        });
        uploadFormData.append("access_token", pageAccessToken);
        uploadFormData.append("published", "false"); // Don't publish yet

        console.log("Uploading Facebook image first...");
        const photoResponse = await axios.post(
          `https://graph.facebook.com/${this.apiVersion}/${pageId}/photos`,
          uploadFormData,
          {
            headers: {
              ...uploadFormData.getHeaders(),
            },
          }
        );

        console.log("Facebook photo upload response:", photoResponse.data);

        if (photoResponse.data && photoResponse.data.id) {
          // Step 2: Create a post with the uploaded photo
          const postUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/feed`;
          const postData = {
            message: postMessage,
            access_token: pageAccessToken,
            attached_media: [{ media_fbid: photoResponse.data.id }],
          };

          console.log("Creating Facebook post with attached media:", postData);
          const response = await axios.post(postUrl, postData);
          console.log("Facebook post created with photo:", response.data);
          return response.data;
        } else {
          throw new Error("Failed to upload image to Facebook");
        }
      } else {
        // Text-only post
        const postUrl = `https://graph.facebook.com/${this.apiVersion}/${pageId}/feed`;
        const postData = {
          message: postMessage,
          access_token: pageAccessToken,
        };

        console.log("Creating text-only Facebook post");
        const response = await axios.post(postUrl, null, { params: postData });
        console.log("Facebook text-only post created:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error creating Facebook post:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Facebook API error details:", error.response.data);
      }
      throw error;
    }
  }

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

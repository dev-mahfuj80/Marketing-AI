import axios from "axios";
import FormData from "form-data";

/**
 * Simplified Facebook API service using page access token directly
 */
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

  async uploadPhotoToPage(
    pageId: string,
    pageAccessToken: string,
    imageUrl: string,
    message?: string
  ) {
    try {
      // For publicly accessible image URLs
      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${pageId}/photos`,
        null,
        {
          params: {
            url: imageUrl,
            caption: message || "",
            access_token: pageAccessToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading photo to Facebook:", error);
      throw new Error("Failed to upload photo to Facebook");
    }
  }
}

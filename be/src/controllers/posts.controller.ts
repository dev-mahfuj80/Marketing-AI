import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { env } from "../config/env";

const prisma = new PrismaClient();

/**
 * Fetch Facebook posts
 */
export const getFacebookPosts = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get user with Facebook token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.facebookToken) {
      return res
        .status(400)
        .json({ message: "Facebook account not connected" });
    }

    // Check if token has expired
    if (user.facebookTokenExpiry && user.facebookTokenExpiry < new Date()) {
      return res.status(401).json({
        message: "Facebook token expired, please reconnect your account",
      });
    }

    // Get Facebook Pages
    const pagesResponse = await axios.get(
      "https://graph.facebook.com/v18.0/me/accounts",
      {
        params: {
          access_token: user.facebookToken,
          fields: "id,name,access_token",
        },
      }
    );

    const pages = pagesResponse.data.data || [];

    if (pages.length === 0) {
      return res.status(404).json({ message: "No Facebook pages found" });
    }

    // Use the first page's access token (can be enhanced to allow page selection)
    const pageAccessToken = pages[0].access_token;
    const pageId = pages[0].id;

    // Get posts from the page
    const postsResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}/posts`,
      {
        params: {
          access_token: pageAccessToken,
          fields:
            "id,message,created_time,permalink_url,attachments{type,url},insights.metric(post_impressions,post_reactions_by_type_total)",
          limit: 10,
        },
      }
    );

    const posts = postsResponse.data.data || [];

    // Transform posts to our format
    const formattedPosts = posts.map((post: any) => {
      const engagement = {
        impressions: post.insights?.data?.[0]?.values?.[0]?.value || 0,
        reactions: 0,
      };

      if (post.insights?.data?.[1]?.values?.[0]?.value) {
        const reactions = post.insights.data[1].values[0].value;
        engagement.reactions = Object.values(reactions).reduce(
          (a: number, b: number) => a + b,
          0
        );
      }

      return {
        id: post.id,
        platformId: post.id,
        platform: "FACEBOOK",
        content: post.message || "",
        mediaUrl: post.attachments?.data?.[0]?.url || null,
        publishedAt: new Date(post.created_time),
        url: post.permalink_url,
        engagement,
      };
    });

    return res.status(200).json({ posts: formattedPosts });
  } catch (error: any) {
    console.error(
      "Error fetching Facebook posts:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Error fetching Facebook posts",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

/**
 * Fetch LinkedIn posts
 */
export const getLinkedInPosts = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get user with LinkedIn token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.linkedInToken) {
      return res
        .status(400)
        .json({ message: "LinkedIn account not connected" });
    }

    // Check if token has expired
    if (user.linkedInTokenExpiry && user.linkedInTokenExpiry < new Date()) {
      return res.status(401).json({
        message: "LinkedIn token expired, please reconnect your account",
      });
    }

    // Get user profile to get URN
    const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${user.linkedInToken}`,
      },
    });

    const personId = profileResponse.data.id;
    const personUrn = `urn:li:person:${personId}`;

    // Get posts from LinkedIn
    const postsResponse = await axios.get(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        params: {
          q: "authors",
          authors: `List(${personUrn})`,
        },
        headers: {
          Authorization: `Bearer ${user.linkedInToken}`,
        },
      }
    );

    const posts = postsResponse.data.elements || [];

    // Transform posts to our format
    const formattedPosts = posts.map((post: any) => {
      let content = "";
      let mediaUrl = null;

      if (
        post.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary
          ?.text
      ) {
        content =
          post.specificContent["com.linkedin.ugc.ShareContent"].shareCommentary
            .text;
      }

      if (
        post.specificContent?.["com.linkedin.ugc.ShareContent"]?.media?.[0]
          ?.originalUrl
      ) {
        mediaUrl =
          post.specificContent["com.linkedin.ugc.ShareContent"].media[0]
            .originalUrl;
      }

      return {
        id: post.id,
        platformId: post.id,
        platform: "LINKEDIN",
        content,
        mediaUrl,
        publishedAt:
          post.created && post.created.time
            ? new Date(post.created.time)
            : new Date(),
        url: null, // LinkedIn API doesn't easily provide permalinks
        engagement: {
          impressions: 0, // LinkedIn requires a separate Social Engagement API call
          reactions: 0,
        },
      };
    });

    return res.status(200).json({ posts: formattedPosts });
  } catch (error: any) {
    console.error(
      "Error fetching LinkedIn posts:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Error fetching LinkedIn posts",
      error: error.response?.data?.message || error.message,
    });
  }
};

/**
 * Create a new post
 */
export const createPost = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { content, platforms, mediaUrl, scheduledDate } = req.body;

    if (
      !content ||
      !platforms ||
      !Array.isArray(platforms) ||
      platforms.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Content and at least one platform are required" });
    }

    // Validate platforms
    const validPlatforms = ["FACEBOOK", "LINKEDIN"];
    const invalidPlatforms = platforms.filter(
      (platform: string) => !validPlatforms.includes(platform)
    );

    if (invalidPlatforms.length > 0) {
      return res
        .status(400)
        .json({ message: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postResults: Array<{
      id: number;
      content: string;
      mediaUrl: string | null;
      status: string;
      platform: string;
      platformId: string | null;
      publishedAt: Date | null;
      userId: number;
    }> = [];
    const errors: { platform: string; message: string }[] = [];

    // Handle scheduled posts
    if (scheduledDate) {
      const scheduledTime = new Date(scheduledDate);

      // ...
      if (isNaN(scheduledTime.getTime()) || scheduledTime <= new Date()) {
        return res
          .status(400)
          .json({ message: "Scheduled date must be in the future" });
      }

      // Create scheduled post in our database
      const scheduledPost = await prisma.post.create({
        data: {
          content,
          mediaUrl,
          status: "SCHEDULED",
          publishedAt: scheduledTime,
          platform: platforms[0], // Use first platform for now
          userId: req.user.id,
        },
      });

      return res.status(201).json({
        message: "Post scheduled successfully",
        post: scheduledPost,
      });
    }

    // Handle immediate posting to platforms
    for (const platform of platforms) {
      try {
        if (platform === "FACEBOOK" && user.facebookToken) {
          // Get Facebook Pages
          const pagesResponse = await axios.get(
            "https://graph.facebook.com/v18.0/me/accounts",
            {
              params: {
                access_token: user.facebookToken,
                fields: "id,name,access_token",
              },
            }
          );

          const pages = pagesResponse.data.data || [];

          if (pages.length === 0) {
            errors.push({ platform, message: "No Facebook pages found" });
            continue;
          }

          // Use the first page's access token
          const pageAccessToken = pages[0].access_token;
          const pageId = pages[0].id;

          // Create post payload
          const postData: Record<string, unknown> = { message: content };

          // Add media if provided
          if (mediaUrl) {
            if (mediaUrl.startsWith("http")) {
              postData.link = mediaUrl;
            } else {
              // For uploaded images, a different endpoint would be needed
              // This is simplified and would need multipart form handling
              errors.push({
                platform,
                message: "Direct image upload not implemented yet",
              });
              continue;
            }
          }

          // Post to Facebook
          const response = await axios.post(
            `https://graph.facebook.com/v18.0/${pageId}/feed`,
            null,
            {
              params: {
                ...postData,
                access_token: pageAccessToken,
              },
            }
          );

          if (response.data?.id) {
            // Save post to database
            const savedPost = await prisma.post.create({
              data: {
                content,
                mediaUrl,
                status: "PUBLISHED",
                platform: "FACEBOOK",
                platformId: response.data.id,
                publishedAt: new Date(),
                userId: req.user.id,
              },
            });

            postResults.push(savedPost);
          }
        } else if (platform === "LINKEDIN" && user.linkedInToken) {
          // Get user profile to get URN
          const profileResponse = await axios.get(
            "https://api.linkedin.com/v2/me",
            {
              headers: {
                Authorization: `Bearer ${user.linkedInToken}`,
              },
            }
          );

          const personId = profileResponse.data.id;
          const personUrn = `urn:li:person:${personId}`;

          // Create post payload
          const postPayload: Record<string, unknown> = {
            author: personUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: content,
                },
                shareMediaCategory: "NONE",
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          };

          // Add media if provided
          if (mediaUrl && mediaUrl.startsWith("http")) {
            postPayload.specificContent[
              "com.linkedin.ugc.ShareContent"
            ].shareMediaCategory = "ARTICLE";
            // Type assertion for ShareContent
            (postPayload.specificContent as any)[
              "com.linkedin.ugc.ShareContent"
            ].media = [
              {
                status: "READY",
                originalUrl: mediaUrl,
              },
            ];
          }

          // Post to LinkedIn
          const response = await axios.post(
            "https://api.linkedin.com/v2/ugcPosts",
            postPayload,
            {
              headers: {
                Authorization: `Bearer ${user.linkedInToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data?.id) {
            // Save post to database
            const savedPost = await prisma.post.create({
              data: {
                content,
                mediaUrl,
                status: "PUBLISHED",
                platform: "LINKEDIN",
                platformId: response.data.id,
                publishedAt: new Date(),
                userId: req.user.id,
              },
            });

            postResults.push(savedPost);
          }
        } else {
          errors.push({ platform, message: "Platform not connected" });
        }
      } catch (error: any) {
        console.error(
          `Error posting to ${platform}:`,
          error.response?.data || error.message
        );
        errors.push({
          platform,
          message: error.response?.data?.error?.message || error.message,
        });
      }
    }

    if (postResults.length === 0 && errors.length > 0) {
      return res
        .status(400)
        .json({ message: "Failed to create posts", errors });
    }

    return res.status(201).json({
      message: "Posts created successfully",
      posts: postResults,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error creating post:", error.message);
    return res.status(500).json({ message: "Server error creating post" });
  }
};

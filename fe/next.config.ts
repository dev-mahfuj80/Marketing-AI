import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // LinkedIn media domain for profile and organization images
      "media.licdn.com",
      // Facebook CDN domains for profile and page images
      "scontent.fdac31-1.fna.fbcdn.net",
      "scontent.fdac31-2.fna.fbcdn.net",
      "scontent.fdac31-3.fna.fbcdn.net",
      "scontent.fdac31-4.fna.fbcdn.net",
      "platform-lookaside.fbsbx.com"
    ],
  },
};

export default nextConfig;

import { Prisma } from "@prisma/client";

// Extend types to include our custom fields
declare global {
  namespace PrismaJson {
    // Define any JSON types here if we need them
  }
}

// Extend UserUpdateInput type to include social media token fields
declare module "@prisma/client" {
  namespace Prisma {
    interface UserUpdateInput {
      facebookToken?: string | null;
      facebookTokenExpiry?: Date | null;
      linkedInToken?: string | null;
      linkedInTokenExpiry?: Date | null;
      facebookAppId?: string | null;
      facebookAppSecret?: string | null;
      facebookPageId?: string | null;
      linkedInAppId?: string | null;
      linkedInAppSecret?: string | null;
    }

    interface UserUncheckedUpdateInput {
      facebookToken?: string | null;
      facebookTokenExpiry?: Date | null;
      linkedInToken?: string | null;
      linkedInTokenExpiry?: Date | null;
      facebookAppId?: string | null;
      facebookAppSecret?: string | null;
      facebookPageId?: string | null;
      linkedInAppId?: string | null;
      linkedInAppSecret?: string | null;
      facebookToken?: string | null;
      linkedInAccessToken?: string | null;
      linkedInRefreshToken?: string | null;
    }

    interface UserCreateInput {
      facebookToken?: string | null;
      facebookTokenExpiry?: Date | null;
      linkedInToken?: string | null;
      linkedInTokenExpiry?: Date | null;
      facebookAppId?: string | null;
      facebookAppSecret?: string | null;
      facebookPageId?: string | null;
      linkedInAppId?: string | null;
      linkedInAppSecret?: string | null;
    }
  }
}

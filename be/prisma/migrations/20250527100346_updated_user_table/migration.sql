/*
  Warnings:

  - You are about to drop the column `facebookTokenExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "facebookTokenExpiry",
DROP COLUMN "linkedInExpiresAt",
DROP COLUMN "linkedInId",
ADD COLUMN     "facebookAppId" TEXT,
ADD COLUMN     "facebookAppSecret" TEXT,
ADD COLUMN     "facebookPageId" TEXT,
ADD COLUMN     "linkedInAppId" TEXT,
ADD COLUMN     "linkedInAppSecret" TEXT;

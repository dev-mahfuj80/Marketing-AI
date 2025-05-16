-- AlterTable
ALTER TABLE "users" ADD COLUMN     "linkedInAccessToken" TEXT,
ADD COLUMN     "linkedInExpiresAt" TIMESTAMP(3),
ADD COLUMN     "linkedInId" TEXT,
ADD COLUMN     "linkedInRefreshToken" TEXT;

/*
  Warnings:

  - You are about to drop the column `linkedInToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInTokenExpiry` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "linkedInToken",
DROP COLUMN "linkedInTokenExpiry";

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "category" TEXT,
    "location" TEXT,
    "description" TEXT,
    "established" TEXT,
    "size" TEXT,
    "employees" TEXT,
    "turnover" TEXT,
    "revenue" TEXT,
    "profit" TEXT,
    "marketArea" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organizations_userId_idx" ON "organizations"("userId");

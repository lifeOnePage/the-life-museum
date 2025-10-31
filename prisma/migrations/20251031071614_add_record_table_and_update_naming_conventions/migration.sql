/*
  Warnings:

  - You are about to drop the column `reelsId` on the `Lifestory` table. All the data in the column will be lost.
  - You are about to drop the column `reelsId` on the `Memory` table. All the data in the column will be lost.
  - You are about to drop the column `reelsId` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the column `reelsId` on the `WheelTexture` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reelId]` on the table `Lifestory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reelId` to the `Lifestory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reelId` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_recordsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lifestory" DROP CONSTRAINT "Lifestory_reelsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Memory" DROP CONSTRAINT "Memory_reelsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Records" DROP CONSTRAINT "Records_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Relationship" DROP CONSTRAINT "Relationship_reelsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WheelTexture" DROP CONSTRAINT "WheelTexture_reelsId_fkey";

-- DropIndex
DROP INDEX "public"."Lifestory_reelsId_key";

-- AlterTable
ALTER TABLE "Lifestory" DROP COLUMN "reelsId",
ADD COLUMN     "reelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "reelsId",
ADD COLUMN     "reelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Relationship" DROP COLUMN "reelsId",
ADD COLUMN     "reelId" INTEGER;

-- AlterTable
ALTER TABLE "WheelTexture" DROP COLUMN "reelsId",
ADD COLUMN     "reelId" INTEGER;

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."Records";

-- DropTable
DROP TABLE "public"."Reels";

-- CreateTable
CREATE TABLE "Reel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "profileImg" TEXT,
    "birthPlace" TEXT,
    "motto" TEXT,
    "lifestoryId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "coverUrl" TEXT,
    "name" TEXT,
    "subName" TEXT,
    "description" TEXT,
    "bgm" TEXT,
    "color" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "date" TEXT,
    "location" TEXT,
    "description" TEXT,
    "color" TEXT,
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "coverUrl" TEXT,
    "recordId" INTEGER NOT NULL,

    CONSTRAINT "RecordItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reel_identifier_key" ON "Reel"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Record_identifier_key" ON "Record"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Lifestory_reelId_key" ON "Lifestory"("reelId");

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lifestory" ADD CONSTRAINT "Lifestory_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelTexture" ADD CONSTRAINT "WheelTexture_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordItem" ADD CONSTRAINT "RecordItem_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

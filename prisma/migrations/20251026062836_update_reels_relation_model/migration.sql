/*
  Warnings:

  - You are about to drop the column `childhoodId` on the `Reels` table. All the data in the column will be lost.
  - You are about to drop the column `memoryId` on the `Reels` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipId` on the `Reels` table. All the data in the column will be lost.
  - You are about to drop the column `childhoodId` on the `WheelTexture` table. All the data in the column will be lost.
  - You are about to drop the `Childhood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_childhoodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_memoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_relationshipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WheelTexture" DROP CONSTRAINT "WheelTexture_childhoodId_fkey";

-- DropIndex
DROP INDEX "public"."Reels_childhoodId_key";

-- DropIndex
DROP INDEX "public"."Reels_memoryId_key";

-- DropIndex
DROP INDEX "public"."Reels_relationshipId_key";

-- AlterTable
ALTER TABLE "Reels" DROP COLUMN "childhoodId",
DROP COLUMN "memoryId",
DROP COLUMN "relationshipId";

-- AlterTable
ALTER TABLE "Relationship" ALTER COLUMN "reelsId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WheelTexture" DROP COLUMN "childhoodId",
ADD COLUMN     "reelsId" INTEGER;

-- DropTable
DROP TABLE "public"."Childhood";

-- AddForeignKey
ALTER TABLE "WheelTexture" ADD CONSTRAINT "WheelTexture_reelsId_fkey" FOREIGN KEY ("reelsId") REFERENCES "Reels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_reelsId_fkey" FOREIGN KEY ("reelsId") REFERENCES "Reels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_reelsId_fkey" FOREIGN KEY ("reelsId") REFERENCES "Reels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

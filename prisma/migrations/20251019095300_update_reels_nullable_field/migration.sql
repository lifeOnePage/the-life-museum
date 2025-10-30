-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_childhoodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_memoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reels" DROP CONSTRAINT "Reels_relationshipId_fkey";

-- AlterTable
ALTER TABLE "Reels" ALTER COLUMN "profileImg" DROP NOT NULL,
ALTER COLUMN "birthPlace" DROP NOT NULL,
ALTER COLUMN "motto" DROP NOT NULL,
ALTER COLUMN "lifestoryId" DROP NOT NULL,
ALTER COLUMN "childhoodId" DROP NOT NULL,
ALTER COLUMN "memoryId" DROP NOT NULL,
ALTER COLUMN "relationshipId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_childhoodId_fkey" FOREIGN KEY ("childhoodId") REFERENCES "Childhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

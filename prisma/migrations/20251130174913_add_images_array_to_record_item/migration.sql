-- AlterTable
ALTER TABLE "RecordItem" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "User" ADD COLUMN "firebaseUid" TEXT;
ALTER TABLE "User" ALTER COLUMN "mobile" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "birthDate" DROP NOT NULL;

CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

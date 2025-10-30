-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "plan" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reels" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "motto" TEXT NOT NULL,
    "lifestoryId" INTEGER NOT NULL,
    "userId" INTEGER,
    "childhoodId" INTEGER NOT NULL,
    "memoryId" INTEGER NOT NULL,
    "relationshipId" INTEGER NOT NULL,

    CONSTRAINT "Reels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lifestory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenUsage" INTEGER NOT NULL DEFAULT 0,
    "mood" TEXT,
    "qaCount" INTEGER,
    "qaList" JSONB,
    "result" TEXT,
    "reelsId" INTEGER NOT NULL,

    CONSTRAINT "Lifestory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheelTexture" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "srcType" INTEGER NOT NULL,
    "srcUrl" TEXT NOT NULL,
    "childhoodId" INTEGER,
    "memoryId" INTEGER,
    "relationshipId" INTEGER,

    CONSTRAINT "WheelTexture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Childhood" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reelsId" INTEGER NOT NULL,

    CONSTRAINT "Childhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "date" TIMESTAMP(3),
    "comment" TEXT,
    "reelsId" INTEGER NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "comment" TEXT,
    "reelsId" INTEGER NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Records" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordsId" INTEGER,
    "title" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Reels_identifier_key" ON "Reels"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Reels_childhoodId_key" ON "Reels"("childhoodId");

-- CreateIndex
CREATE UNIQUE INDEX "Reels_memoryId_key" ON "Reels"("memoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Reels_relationshipId_key" ON "Reels"("relationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Lifestory_reelsId_key" ON "Lifestory"("reelsId");

-- CreateIndex
CREATE UNIQUE INDEX "Records_identifier_key" ON "Records"("identifier");

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_childhoodId_fkey" FOREIGN KEY ("childhoodId") REFERENCES "Childhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reels" ADD CONSTRAINT "Reels_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lifestory" ADD CONSTRAINT "Lifestory_reelsId_fkey" FOREIGN KEY ("reelsId") REFERENCES "Reels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelTexture" ADD CONSTRAINT "WheelTexture_childhoodId_fkey" FOREIGN KEY ("childhoodId") REFERENCES "Childhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelTexture" ADD CONSTRAINT "WheelTexture_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelTexture" ADD CONSTRAINT "WheelTexture_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Records" ADD CONSTRAINT "Records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_recordsId_fkey" FOREIGN KEY ("recordsId") REFERENCES "Records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

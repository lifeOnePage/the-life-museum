-- Scene 모델 추가 마이그레이션
-- 수동 실행: psql 명령어나 DB 클라이언트를 통해 실행하세요

-- CreateTable Scene
CREATE TABLE "Scene" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "profileName" TEXT,
    "profileBirthDate" TEXT,
    "profileBirthPlace" TEXT,
    "profileBiography" TEXT,
    "lifestoryProgress" JSONB,
    "userId" INTEGER,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable SceneItem
CREATE TABLE "SceneItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "date" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sceneId" INTEGER NOT NULL,

    CONSTRAINT "SceneItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable SceneImage
CREATE TABLE "SceneImage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "SceneImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scene_identifier_key" ON "Scene"("identifier");

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneItem" ADD CONSTRAINT "SceneItem_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneImage" ADD CONSTRAINT "SceneImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SceneItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

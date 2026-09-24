-- CreateEnum
CREATE TYPE "EngagementKind" AS ENUM ('VIEW', 'SHARE');

-- CreateTable
CREATE TABLE "post_engagements" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "kind" "EngagementKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_engagements_postId_viewerKey_kind_key" ON "post_engagements"("postId", "viewerKey", "kind");

-- AddForeignKey
ALTER TABLE "post_engagements" ADD CONSTRAINT "post_engagements_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


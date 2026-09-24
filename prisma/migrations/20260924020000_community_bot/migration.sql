-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('RSS', 'DEVTO', 'HACKERNEWS');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "community_feeds" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "type" "FeedType" NOT NULL,
    "source" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_feeds_communityId_type_source_key" ON "community_feeds"("communityId", "type", "source");

-- CreateIndex
CREATE UNIQUE INDEX "posts_communityId_sourceUrl_key" ON "posts"("communityId", "sourceUrl");

-- AddForeignKey
ALTER TABLE "community_feeds" ADD CONSTRAINT "community_feeds_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Seed: the account bot posts are attributed to.
INSERT INTO "users" ("id", "username", "displayName", "avatarUrl", "bio", "isBot")
VALUES ('connexus-bot', 'connexus-bot', 'Connexus Bot',
        'https://api.dicebear.com/9.x/bottts-neutral/png?seed=connexus',
        'I share the most relevant news and articles to each community every hour.', true)
ON CONFLICT ("id") DO NOTHING;

-- Seed: a JavaScript community owned by the bot.
INSERT INTO "communities" ("id", "name", "slug", "description", "visibility", "ownerId", "iconUrl")
VALUES (gen_random_uuid()::text, 'JavaScript', 'javascript',
        'Everything JavaScript — language updates, runtimes, frameworks and tooling.', 'PUBLIC', 'connexus-bot',
        'https://api.dicebear.com/9.x/notionists/png?seed=javascript')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "community_members" ("id", "communityId", "userId", "role")
SELECT gen_random_uuid()::text, c."id", 'connexus-bot', 'OWNER' FROM "communities" c WHERE c."slug" = 'javascript'
ON CONFLICT ("communityId", "userId") DO NOTHING;

-- Seed: sources per community (skipped silently where a slug doesn't exist).
INSERT INTO "community_feeds" ("id", "communityId", "type", "source")
SELECT gen_random_uuid()::text, c."id", f."type"::"FeedType", f."source"
FROM (VALUES
    ('public-news',       'RSS',        'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en'),
    ('public-news',       'RSS',        'https://feeds.bbci.co.uk/news/world/rss.xml'),
    ('javascript',        'DEVTO',      'javascript'),
    ('javascript',        'HACKERNEWS', 'javascript'),
    ('javascript',        'RSS',        'https://javascriptweekly.com/rss/'),
    ('frontend-founders', 'DEVTO',      'frontend'),
    ('frontend-founders', 'DEVTO',      'css'),
    ('frontend-founders', 'RSS',        'https://www.smashingmagazine.com/feed/'),
    ('frontend-founders', 'RSS',        'https://css-tricks.com/feed/'),
    ('backend-devs',      'DEVTO',      'backend'),
    ('backend-devs',      'DEVTO',      'node'),
    ('backend-devs',      'HACKERNEWS', 'postgres'),
    ('devops-updates',    'DEVTO',      'devops'),
    ('devops-updates',    'RSS',        'https://kubernetes.io/feed.xml'),
    ('devops-updates',    'RSS',        'https://github.blog/changelog/feed/'),
    ('devops-updates',    'HACKERNEWS', 'kubernetes')
) AS f("slug", "type", "source")
JOIN "communities" c ON c."slug" = f."slug"
ON CONFLICT ("communityId", "type", "source") DO NOTHING;

import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "@/infra/db/connect";
import { fetchFeed, type FeedConfig, type FeedItem } from "../bot/sources";
import { composePost } from "../bot/writer";
import { resolvePostImage } from "../bot/images";
import { PostType } from "../../../generated/prisma/enums";
import { computeHotScore } from "../utils/hotScore";

/** Seeded by the `community_bot` migration. */
export const BOT_USER_ID = "connexus-bot";

const MAX_ITEM_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CANDIDATES = 12;
// Guards against a retried or manually re-run job double-posting within one
// 15-minute schedule slot (see src/jobs/communityBot.ts).
const MIN_GAP_BETWEEN_POSTS_MS = 12 * 60 * 1000;

export type BotRunResult =
    | { status: "posted"; postId: string; title: string; sourceUrl: string; imageUrl: string | null }
    | { status: "skipped"; reason: string };

export class CommunityBotService {
    /** Communities with at least one enabled feed. */
    static async listBotCommunities() {
        return prisma.communities.findMany({
            where: { community_feeds: { some: { enabled: true } } },
            select: { id: true, slug: true },
            orderBy: { slug: "asc" },
        });
    }

    /** `force` skips the recent-post guard (manual runs only); article dedup still applies. */
    static async postToCommunity(communityId: string, { force = false } = {}): Promise<BotRunResult> {
        const community = await prisma.communities.findUnique({
            where: { id: communityId },
            include: { community_feeds: { where: { enabled: true } } },
        });
        if (!community) return { status: "skipped", reason: "community not found" };
        if (community.community_feeds.length === 0) return { status: "skipped", reason: "no enabled feeds" };

        const lastBotPost = await prisma.posts.findFirst({
            where: { communityId, authorId: BOT_USER_ID },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });
        if (!force && lastBotPost && Date.now() - lastBotPost.createdAt.getTime() < MIN_GAP_BETWEEN_POSTS_MS) {
            return { status: "skipped", reason: "posted recently" };
        }

        const candidates = await CommunityBotService.gatherCandidates(communityId, community.community_feeds);
        if (candidates.length === 0) return { status: "skipped", reason: "no new items in feeds" };

        const composed = await composePost(community, candidates);
        if (!composed) return { status: "skipped", reason: "nothing relevant enough to post" };

        const imageUrl = await resolvePostImage(composed.item);

        try {
            const post = await prisma.posts.create({
                data: {
                    id: crypto.randomUUID(),
                    title: composed.title,
                    content: `${composed.body}\n\nSource: ${composed.item.source}`,
                    sourceUrl: composed.item.url,
                    imageUrl,
                    type: imageUrl ? PostType.IMAGE : PostType.TEXT,
                    communityId,
                    authorId: BOT_USER_ID,
                    hotScore: computeHotScore(0, new Date()),
                },
            });
            return { status: "posted", postId: post.id, title: post.title, sourceUrl: composed.item.url, imageUrl };
        } catch (error) {
            // Another run posted the same article first.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return { status: "skipped", reason: "article already posted" };
            }
            throw error;
        }
    }

    /** Fresh, not-yet-posted items across all of the community's feeds, newest first. */
    private static async gatherCandidates(communityId: string, feeds: FeedConfig[]): Promise<FeedItem[]> {
        const results = await Promise.allSettled(feeds.map(fetchFeed));
        results.forEach((r, i) => {
            if (r.status === "rejected") console.warn(`Feed failed (${feeds[i].type} ${feeds[i].source}):`, r.reason);
        });

        const cutoff = Date.now() - MAX_ITEM_AGE_MS;
        const byUrl = new Map<string, FeedItem>();
        for (const result of results) {
            if (result.status !== "fulfilled") continue;
            for (const item of result.value) {
                if (item.publishedAt.getTime() >= cutoff && !byUrl.has(item.url)) byUrl.set(item.url, item);
            }
        }

        const alreadyPosted = await prisma.posts.findMany({
            where: { communityId, sourceUrl: { in: [...byUrl.keys()] } },
            select: { sourceUrl: true },
        });
        for (const { sourceUrl } of alreadyPosted) if (sourceUrl) byUrl.delete(sourceUrl);

        return [...byUrl.values()]
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
            .slice(0, MAX_CANDIDATES);
    }
}

export default CommunityBotService;

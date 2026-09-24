import { prisma } from "@/infra/db/connect";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight UTC of the day containing `date`. */
export function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export class CommunityAnalyticsService {
    /**
     * Writes one snapshot per community describing it as of the end of `day` (UTC).
     * Members, posts and votes are counted by their timestamps, so past days can be
     * backfilled. Views have no history, so a backfilled day uses the current view
     * counts of posts that existed then.
     */
    static async snapshotDay(day: Date): Promise<number> {
        const date = startOfUtcDay(day);
        const end = new Date(date.getTime() + DAY_MS);

        const [communities, members, posts, votes] = await Promise.all([
            prisma.communities.findMany({ where: { createdAt: { lt: end } }, select: { id: true } }),
            prisma.community_members.groupBy({
                by: ["communityId"],
                where: { joinedAt: { lt: end } },
                _count: { _all: true },
            }),
            prisma.posts.groupBy({
                by: ["communityId"],
                where: { createdAt: { lt: end } },
                _count: { _all: true },
                _sum: { viewCount: true },
            }),
            prisma.$queryRaw<{ communityId: string; value: "UP" | "DOWN"; count: number }[]>`
                SELECT p."communityId", v.value::text AS value, COUNT(*)::int AS count
                FROM votes v JOIN posts p ON p.id = v."postId"
                WHERE v."createdAt" < ${end}
                GROUP BY 1, 2`,
        ]);

        const memberCount = new Map(members.map((m) => [m.communityId, m._count._all]));
        const postStats = new Map(posts.map((p) => [p.communityId, p]));
        const voteCount = (communityId: string, value: "UP" | "DOWN") =>
            votes.find((v) => v.communityId === communityId && v.value === value)?.count ?? 0;

        await prisma.$transaction(
            communities.map(({ id }) => {
                const stats = {
                    memberCount: memberCount.get(id) ?? 0,
                    postCount: postStats.get(id)?._count._all ?? 0,
                    totalUpvotes: voteCount(id, "UP"),
                    totalDownvotes: voteCount(id, "DOWN"),
                    totalViews: postStats.get(id)?._sum.viewCount ?? 0,
                };
                return prisma.community_analytics_snapshots.upsert({
                    where: { communityId_date: { communityId: id, date } },
                    create: { id: crypto.randomUUID(), communityId: id, date, ...stats },
                    update: stats,
                });
            })
        );

        return communities.length;
    }
}

export default CommunityAnalyticsService;

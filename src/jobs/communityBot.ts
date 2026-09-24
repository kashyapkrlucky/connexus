import { logger, schedules, task } from "@trigger.dev/sdk";
import { CommunityBotService } from "@/server/services/CommunityBotService";

/** Keep in sync with the cron below and CommunityBotService's MIN_GAP_BETWEEN_POSTS_MS. */
const INTERVAL_MINUTES = 15;

/** Curates and publishes one post to a single community. */
export const postToCommunity = task({
    id: "community-bot-post",
    maxDuration: 180,
    run: async (payload: { communityId: string; slug: string }) => {
        const result = await CommunityBotService.postToCommunity(payload.communityId);
        logger.info(`c/${payload.slug}: ${result.status}`, result);
        return result;
    },
});

/**
 * Every 15 minutes, fan out one run per bot-enabled community, spread across the
 * interval so posts don't all land at the same minute.
 */
export const communityBotSchedule = schedules.task({
    id: "community-bot-schedule",
    cron: `*/${INTERVAL_MINUTES} * * * *`,
    run: async (payload) => {
        const communities = await CommunityBotService.listBotCommunities();
        if (communities.length === 0) return { scheduled: 0 };

        // Leave a couple of minutes' headroom before the next tick.
        const spacingMs = Math.floor(((INTERVAL_MINUTES - 2) * 60 * 1000) / communities.length);
        const slotKey = payload.timestamp.toISOString().slice(0, 16);

        await postToCommunity.batchTrigger(
            communities.map((c, i) => ({
                payload: { communityId: c.id, slug: c.slug },
                options: {
                    delay: new Date(payload.timestamp.getTime() + i * spacingMs),
                    idempotencyKey: `community-bot:${c.id}:${slotKey}`,
                },
            }))
        );

        logger.info(`Scheduled ${communities.length} community posts`, { slugs: communities.map((c) => c.slug) });
        return { scheduled: communities.length };
    },
});

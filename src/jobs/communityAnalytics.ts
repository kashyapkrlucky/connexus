import { logger, schedules } from "@trigger.dev/sdk";
import { CommunityAnalyticsService } from "@/server/services/CommunityAnalyticsService";

/** Shortly after midnight UTC, snapshot every community for the day that just ended. */
export const communityAnalyticsDaily = schedules.task({
    id: "community-analytics-daily",
    cron: "5 0 * * *",
    run: async (payload) => {
        const yesterday = new Date(payload.timestamp.getTime() - 24 * 60 * 60 * 1000);
        const count = await CommunityAnalyticsService.snapshotDay(yesterday);
        logger.info(`Snapshotted ${count} communities`, { day: yesterday.toISOString().slice(0, 10) });
        return { communities: count };
    },
});

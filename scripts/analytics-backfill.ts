// Backfills daily community analytics snapshots. Usage:
//   npm run analytics:backfill        — the last 30 days, including today
//   npm run analytics:backfill -- 90  — the last 90 days
import "dotenv/config";
import { CommunityAnalyticsService } from "@/server/services/CommunityAnalyticsService";

async function main() {
    const days = Number(process.argv[2]) || 30;
    for (let i = days - 1; i >= 0; i--) {
        const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const count = await CommunityAnalyticsService.snapshotDay(day);
        console.log(`${day.toISOString().slice(0, 10)}: ${count} communities`);
    }
}

main().then(() => process.exit(0), (error) => {
    console.error(error);
    process.exit(1);
});

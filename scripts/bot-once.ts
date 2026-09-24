// Runs one bot pass immediately, without Trigger.dev. Usage:
//   npm run bot:once                      — every bot-enabled community
//   npm run bot:once -- javascript         — a single community by slug
//   npm run bot:once -- javascript --force — post even if the bot posted there recently
import "dotenv/config";
import { CommunityBotService } from "@/server/services/CommunityBotService";

async function main() {
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const slug = args.find((a) => !a.startsWith("--"));
    const communities = (await CommunityBotService.listBotCommunities()).filter((c) => !slug || c.slug === slug);
    if (communities.length === 0) {
        console.log(slug ? `No bot-enabled community "${slug}".` : "No bot-enabled communities.");
        return;
    }

    for (const c of communities) {
        const result = await CommunityBotService.postToCommunity(c.id, { force });
        console.log(`c/${c.slug}:`, result);
    }
}

main().then(() => process.exit(0), (error) => {
    console.error(error);
    process.exit(1);
});

// Adds images to existing bot posts that were created before image support.
// Only touches bot posts with a source link and no image. Usage:
//   npm run bot:backfill-images
import "dotenv/config";
import { prisma } from "@/infra/db/connect";
import { resolvePostImage } from "@/server/bot/images";
import { BOT_USER_ID } from "@/server/services/CommunityBotService";
import { PostType } from "../generated/prisma/enums";

async function main() {
    const posts = await prisma.posts.findMany({
        where: { authorId: BOT_USER_ID, imageUrl: null, sourceUrl: { not: null } },
        select: { id: true, title: true, sourceUrl: true },
    });

    let updated = 0;
    for (const post of posts) {
        const imageUrl = await resolvePostImage({
            title: post.title,
            url: post.sourceUrl!,
            summary: "",
            source: "",
            publishedAt: new Date(),
        });
        if (!imageUrl) continue;

        await prisma.posts.update({ where: { id: post.id }, data: { imageUrl, type: PostType.IMAGE } });
        updated++;
        console.log(`✓ ${post.title.slice(0, 70)}`);
    }
    console.log(`\nAdded images to ${updated} of ${posts.length} posts.`);
}

main().then(() => process.exit(0), (error) => {
    console.error(error);
    process.exit(1);
});

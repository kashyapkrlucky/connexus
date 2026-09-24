import { logger, schedules, wait } from "@trigger.dev/sdk";
import { NewsService } from "@/server/services/NewsService";
import { prisma } from "@/infra/db/connect";

export const firstScheduledTask = schedules.task({
  id: "first-scheduled-task",
  // Every minute
  cron: "* * * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {

    console.log("Hello World!");

    const communities = [
      { id: "24b299b2-9ec4-4821-9937-cd3af8cdc92e", name: "Frontend Founders" },
      { id: "3870b173-fa27-4ff5-b9e8-eb6ead3b87a0", name: "Backend Devs" },
      { id: "ab84c1cc-5e0e-45f4-be72-f7a1efcb58b5", name: "DevOps Updates" },
      { id: "0cd7161f-8847-4151-8e09-d60f89c32627", name: "Public News" }
    ]

    const selectedCommunity = communities[Math.floor(Math.random() * communities.length)];
    console.log("Selected community:", selectedCommunity);

    const authorId = "697bda6543d17370a8bd653d";

    const item = await NewsService.getByTopic(selectedCommunity.name);
    
    const post = {
      title: item.title,
      content: item.content || "",
      communityId: selectedCommunity.id,
      authorId: authorId
    }

    console.log(post);

    await prisma.posts.create({
      data: {
        ...post,
        id: crypto.randomUUID()
      }
    });
    
    
    // // The payload contains the last run timestamp that you can use to check if this is the first run
    // // And calculate the time since the last run
    // const distanceInMs =
    //   payload.timestamp.getTime() - (payload.lastTimestamp ?? new Date()).getTime();

    // logger.log("First scheduled tasks", { payload, distanceInMs });

    // // Wait for 5 seconds
    // await wait.for({ seconds: 5 });

    // // Format the timestamp using the timezone from the payload
    // const formatted = payload.timestamp.toLocaleString("en-US", {
    //   timeZone: payload.timezone,
    // });

    // logger.log(formatted);
  },
});
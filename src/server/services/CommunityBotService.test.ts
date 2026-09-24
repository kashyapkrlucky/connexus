import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedItem } from "../bot/sources";

const prisma = vi.hoisted(() => ({
  communities: { findUnique: vi.fn(), findMany: vi.fn() },
  posts: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
}));
const fetchFeed = vi.hoisted(() => vi.fn());
const composePost = vi.hoisted(() => vi.fn());
const resolvePostImage = vi.hoisted(() => vi.fn());

vi.mock("@/infra/db/connect", () => ({ prisma }));
vi.mock("../bot/sources", () => ({ fetchFeed }));
vi.mock("../bot/writer", () => ({ composePost }));
vi.mock("../bot/images", () => ({ resolvePostImage }));

const { CommunityBotService, BOT_USER_ID } = await import("./CommunityBotService");

const DAY = 24 * 60 * 60 * 1000;
const feedItem = (url: string, ageMs = 0): FeedItem => ({
  title: url,
  url,
  summary: "s",
  source: "Src",
  publishedAt: new Date(Date.now() - ageMs),
});

beforeEach(() => {
  vi.clearAllMocks();
  prisma.communities.findUnique.mockResolvedValue({
    id: "c1",
    name: "JavaScript",
    description: "JS",
    community_feeds: [{ type: "RSS", source: "https://feed.example" }],
  });
  prisma.posts.findFirst.mockResolvedValue(null);
  prisma.posts.findMany.mockResolvedValue([]);
  prisma.posts.create.mockImplementation(async ({ data }) => ({ id: "p1", title: data.title }));
  resolvePostImage.mockResolvedValue(null);
});

describe("CommunityBotService.postToCommunity", () => {
  it("skips a community the bot posted in minutes ago, unless forced", async () => {
    prisma.posts.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 5 * 60 * 1000) });
    await expect(CommunityBotService.postToCommunity("c1")).resolves.toEqual({ status: "skipped", reason: "posted recently" });

    fetchFeed.mockResolvedValue([]);
    await expect(CommunityBotService.postToCommunity("c1", { force: true })).resolves.toMatchObject({ reason: "no new items in feeds" });
  });

  it("only offers fresh, not-yet-posted items to the writer, newest first", async () => {
    fetchFeed.mockResolvedValue([
      feedItem("https://old.example", 10 * DAY),
      feedItem("https://posted.example", DAY),
      feedItem("https://new.example", 0),
      feedItem("https://new.example", 0),
    ]);
    prisma.posts.findMany.mockResolvedValue([{ sourceUrl: "https://posted.example" }]);
    composePost.mockResolvedValue(null);

    await CommunityBotService.postToCommunity("c1");
    const [, candidates] = composePost.mock.calls[0];
    expect(candidates.map((c: FeedItem) => c.url)).toEqual(["https://new.example"]);
  });

  it("keeps going when one feed fails", async () => {
    prisma.communities.findUnique.mockResolvedValue({
      id: "c1", name: "JS", description: "", community_feeds: [{ type: "RSS", source: "a" }, { type: "RSS", source: "b" }],
    });
    fetchFeed.mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce([feedItem("https://ok.example")]);
    composePost.mockResolvedValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await CommunityBotService.postToCommunity("c1");
    expect(composePost.mock.calls[0][1]).toHaveLength(1);
  });

  it("creates the post as the bot with its source link and image", async () => {
    const item = feedItem("https://article.example");
    fetchFeed.mockResolvedValue([item]);
    composePost.mockResolvedValue({ item, title: "Title", body: "Body" });
    resolvePostImage.mockResolvedValue("https://cdn.example/cover.jpg");

    const result = await CommunityBotService.postToCommunity("c1");

    expect(result).toMatchObject({ status: "posted", postId: "p1", imageUrl: "https://cdn.example/cover.jpg" });
    expect(prisma.posts.create.mock.calls[0][0].data).toMatchObject({
      authorId: BOT_USER_ID,
      communityId: "c1",
      sourceUrl: "https://article.example",
      imageUrl: "https://cdn.example/cover.jpg",
      type: "IMAGE",
      content: "Body\n\nSource: Src",
    });
  });
});

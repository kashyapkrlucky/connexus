import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFeed } from "./sources";

function mockFetch(body: unknown, contentType = "application/xml") {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(text, { headers: { "content-type": contentType } })));
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchFeed: RSS", () => {
  it("parses items, strips the Google News publisher suffix and double-encoded HTML", async () => {
    mockFetch(`<?xml version="1.0"?><rss><channel><title>Google News</title>
      <item>
        <title>Big headline - The Daily</title>
        <link>https://news.google.com/rss/articles/abc</link>
        <pubDate>Wed, 24 Sep 2026 03:17:09 GMT</pubDate>
        <description>&lt;a href="x"&gt;Big headline&lt;/a&gt;&amp;nbsp;&amp;nbsp;&lt;font&gt;The Daily&lt;/font&gt;</description>
        <source url="https://daily.example">The Daily</source>
      </item></channel></rss>`);

    const [item] = await fetchFeed({ type: "RSS", source: "https://news.google.com/rss" });
    expect(item).toMatchObject({
      title: "Big headline",
      url: "https://news.google.com/rss/articles/abc",
      source: "The Daily",
      summary: "Big headline The Daily",
    });
    expect(item.publishedAt.toISOString()).toBe("2026-09-24T03:17:09.000Z");
  });

  it("reads CDATA, falls back to the channel title and finds embedded images", async () => {
    mockFetch(`<rss><channel><title>Smashing Magazine</title>
      <item>
        <title><![CDATA[Container queries & you]]></title>
        <link>https://example.com/cq</link>
        <pubDate>Mon, 22 Sep 2026 10:00:00 GMT</pubDate>
        <description><![CDATA[<p>Stop treating <b>container</b> queries like media queries.</p>]]></description>
        <enclosure url="http://files.example.com/cq.jpg" type="image/jpeg" length="1" />
      </item></channel></rss>`);

    const [item] = await fetchFeed({ type: "RSS", source: "https://example.com/feed" });
    expect(item).toMatchObject({
      title: "Container queries & you",
      source: "Smashing Magazine",
      summary: "Stop treating container queries like media queries.",
      thumbnailUrl: "http://files.example.com/cq.jpg",
    });
  });

  it("parses Atom entries with href links", async () => {
    mockFetch(`<feed><title>Kubernetes Blog</title>
      <entry>
        <title>Spotlight on SIG Apps</title>
        <link href="https://kubernetes.io/blog/sig-apps/" />
        <updated>2026-09-22T18:00:00Z</updated>
        <summary>As adoption grew...</summary>
      </entry></feed>`);

    const [item] = await fetchFeed({ type: "RSS", source: "https://kubernetes.io/feed.xml" });
    expect(item).toMatchObject({ title: "Spotlight on SIG Apps", url: "https://kubernetes.io/blog/sig-apps/", source: "Kubernetes Blog" });
  });

  it("skips items without a title, link or valid date", async () => {
    mockFetch(`<rss><channel><title>X</title>
      <item><title>No date</title><link>https://a.example</link></item>
      <item><title>Bad date</title><link>https://b.example</link><pubDate>not a date</pubDate></item>
      </channel></rss>`);
    expect(await fetchFeed({ type: "RSS", source: "https://x.example/feed" })).toEqual([]);
  });

  it("throws on a non-2xx response so the caller can log the failing feed", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));
    await expect(fetchFeed({ type: "RSS", source: "https://down.example/feed" })).rejects.toThrow("503");
  });
});

describe("fetchFeed: APIs", () => {
  it("maps dev.to articles, including the cover image", async () => {
    mockFetch([{ title: "Hello", url: "https://dev.to/a/hello", description: "Hi", published_at: "2026-09-22T16:43:06Z", cover_image: "https://media2.dev.to/c.png" }], "application/json");
    const [item] = await fetchFeed({ type: "DEVTO", source: "javascript" });
    expect(item).toMatchObject({ title: "Hello", source: "DEV Community", coverImageUrl: "https://media2.dev.to/c.png" });
  });

  it("maps Hacker News hits, linking text posts to their HN discussion", async () => {
    mockFetch({
      hits: [
        { objectID: "1", title: "Link story", url: "https://www.example.com/post", points: 55, created_at: "2026-09-22T19:58:47Z" },
        { objectID: "2", title: "Ask HN", url: null, points: 40, created_at: "2026-09-22T19:58:47Z" },
      ],
    }, "application/json");
    const [link, ask] = await fetchFeed({ type: "HACKERNEWS", source: "javascript" });
    expect(link).toMatchObject({ url: "https://www.example.com/post", source: "example.com", summary: "Trending on Hacker News with 55 points." });
    expect(ask).toMatchObject({ url: "https://news.ycombinator.com/item?id=2", source: "Hacker News" });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePostImage } from "./images";
import type { FeedItem } from "./sources";

const item = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  title: "t",
  url: "https://blog.example.com/post",
  summary: "",
  source: "Blog",
  publishedAt: new Date(),
  ...overrides,
});

const image = () => new Response("img", { headers: { "content-type": "image/png", "content-length": "3" } });
const html = (head: string) => new Response(`<html><head>${head}</head><body>...</body></html>`, { headers: { "content-type": "text/html" } });

/** Routes fetch by URL; anything unrouted 404s. Returns the list of requested URLs. */
function routeFetch(routes: Record<string, () => Response>) {
  const requested: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL) => {
    const url = String(input);
    requested.push(url);
    return routes[url]?.() ?? new Response("not found", { status: 404 });
  }));
  return requested;
}

afterEach(() => vi.unstubAllGlobals());

describe("resolvePostImage", () => {
  it("prefers the source's own cover image without fetching the article", async () => {
    const requested = routeFetch({ "https://media2.dev.to/cover.png": image });
    await expect(resolvePostImage(item({ coverImageUrl: "https://media2.dev.to/cover.png" }))).resolves.toBe("https://media2.dev.to/cover.png");
    expect(requested).not.toContain("https://blog.example.com/post");
  });

  it("reads og:image from the article, in either attribute order, resolving relative URLs", async () => {
    routeFetch({
      "https://blog.example.com/post": () => html(`<meta content="/img/share.jpg" property="og:image">`),
      "https://blog.example.com/img/share.jpg": image,
    });
    await expect(resolvePostImage(item())).resolves.toBe("https://blog.example.com/img/share.jpg");
  });

  it("falls back to twitter:image, then to the feed thumbnail", async () => {
    routeFetch({
      "https://blog.example.com/post": () => html(`<meta name="twitter:image" content="https://cdn.example.com/t.jpg">`),
      "https://cdn.example.com/t.jpg": image,
    });
    await expect(resolvePostImage(item())).resolves.toBe("https://cdn.example.com/t.jpg");

    routeFetch({ "https://blog.example.com/post": () => html(""), "https://cdn.example.com/thumb.jpg": image });
    await expect(resolvePostImage(item({ thumbnailUrl: "https://cdn.example.com/thumb.jpg" }))).resolves.toBe("https://cdn.example.com/thumb.jpg");
  });

  it("upgrades http images to https", async () => {
    routeFetch({ "https://blog.example.com/post": () => html(""), "https://files.example.com/a.jpg": image });
    await expect(resolvePostImage(item({ thumbnailUrl: "http://files.example.com/a.jpg" }))).resolves.toBe("https://files.example.com/a.jpg");
  });

  it("never fetches private or local addresses", async () => {
    const requested = routeFetch({});
    for (const url of ["https://localhost/x.png", "https://127.0.0.1/x.png", "https://intranet/x.png", "ftp://example.com/x.png"]) {
      await expect(resolvePostImage(item({ url: "https://news.google.com/a", thumbnailUrl: url }))).resolves.toBeNull();
    }
    expect(requested).toEqual([]);
  });

  it("skips aggregator pages and rejects URLs that don't serve an image", async () => {
    const requested = routeFetch({
      "https://cdn.example.com/page.html": () => html(""),
      "https://cdn.example.com/logo.svg": () => new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }),
    });
    await expect(resolvePostImage(item({ url: "https://news.google.com/rss/articles/abc", thumbnailUrl: "https://cdn.example.com/page.html" }))).resolves.toBeNull();
    await expect(resolvePostImage(item({ url: "https://news.google.com/rss/articles/abc", thumbnailUrl: "https://cdn.example.com/logo.svg" }))).resolves.toBeNull();
    expect(requested.some((u) => u.includes("news.google.com"))).toBe(false);
  });
});

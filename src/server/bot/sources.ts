import { FeedType } from "../../../generated/prisma/enums";

export interface FeedItem {
    title: string;
    url: string;
    summary: string;
    source: string;
    publishedAt: Date;
    /** Full-size cover from the source's own API (dev.to); preferred as-is. */
    coverImageUrl?: string;
    /** Image embedded in an RSS item; may be a small thumbnail. */
    thumbnailUrl?: string;
}

export interface FeedConfig {
    type: FeedType;
    source: string;
}

const USER_AGENT = "Mozilla/5.0 (compatible; ConnexusBot/1.0)";
const ITEMS_PER_FEED = 15;
const SUMMARY_MAX_LENGTH = 500;

export function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
    switch (feed.type) {
        case FeedType.RSS:
            return fetchRss(feed.source);
        case FeedType.DEVTO:
            return fetchDevTo(feed.source);
        case FeedType.HACKERNEWS:
            return fetchHackerNews(feed.source);
    }
}

async function getText(url: string): Promise<string> {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return res.text();
}

async function fetchDevTo(tag: string): Promise<FeedItem[]> {
    const url = `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&top=2&per_page=${ITEMS_PER_FEED}`;
    const articles: { title: string; url: string; description: string; published_at: string; cover_image: string | null }[] = JSON.parse(
        await getText(url)
    );
    return articles.map((a) => ({
        title: a.title,
        url: a.url,
        summary: a.description ?? "",
        source: "DEV Community",
        publishedAt: new Date(a.published_at),
        coverImageUrl: a.cover_image ?? undefined,
    }));
}

async function fetchHackerNews(query: string): Promise<FeedItem[]> {
    const url =
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}` +
        `&tags=story&numericFilters=points%3E30&hitsPerPage=${ITEMS_PER_FEED}`;
    const { hits }: { hits: { objectID: string; title: string; url: string | null; points: number; created_at: string }[] } =
        JSON.parse(await getText(url));
    return hits.map((h) => ({
        title: h.title,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        summary: `Trending on Hacker News with ${h.points} points.`,
        source: h.url ? new URL(h.url).hostname.replace(/^www\./, "") : "Hacker News",
        publishedAt: new Date(h.created_at),
    }));
}

// Minimal RSS 2.0 / Atom reader — enough for news and blog feeds, no dependency.
async function fetchRss(feedUrl: string): Promise<FeedItem[]> {
    const xml = await getText(feedUrl);
    const channelTitle = cleanText(tag(xml.split(/<(?:item|entry)[\s>]/)[0], "title")) || new URL(feedUrl).hostname;
    const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/g) ?? [];

    return blocks.slice(0, ITEMS_PER_FEED).flatMap((block) => {
        const title = cleanText(tag(block, "title"));
        const url = (tag(block, "link") || block.match(/<link[^>]*href="([^"]+)"/)?.[1] || "").trim();
        const date = new Date(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated"));
        if (!title || !url || Number.isNaN(date.getTime())) return [];

        const source = cleanText(tag(block, "source")) || channelTitle;
        // Google News appends " - Publisher" to every title.
        const trimmedTitle = title.endsWith(` - ${source}`) ? title.slice(0, -(source.length + 3)) : title;
        const summary = cleanText(tag(block, "description") || tag(block, "summary") || tag(block, "content"));

        return [
            {
                title: trimmedTitle,
                url,
                summary: truncate(summary),
                source,
                publishedAt: date,
                thumbnailUrl: findEmbeddedImage(block),
            },
        ];
    });
}

/** media:thumbnail / media:content / image enclosure, else the first <img> in the item's HTML. */
function findEmbeddedImage(block: string): string | undefined {
    const attr = (pattern: RegExp) => block.match(pattern)?.[1];
    const found =
        attr(/<media:thumbnail[^>]*\surl="([^"]+)"/) ||
        attr(/<media:content[^>]*\surl="([^"]+)"[^>]*(?:medium="image"|type="image\/)/) ||
        attr(/<enclosure[^>]*\surl="([^"]+)"[^>]*type="image\//) ||
        attr(/<img[^>]+src=["']([^"']+)/) ||
        attr(/&lt;img[^&]*?src=(?:&quot;|")([^&"]+)/);
    return found ? decodeEntities(found) : undefined;
}

function tag(xml: string, name: string): string {
    return xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1] ?? "";
}

function cleanText(raw: string): string {
    // Some feeds (e.g. Google News) escape their HTML twice, so decode again after stripping tags.
    const html = decodeEntities(raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
    return decodeEntities(html.replace(/<[^>]+>/g, " "))
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;|&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
}

function truncate(text: string): string {
    return text.length > SUMMARY_MAX_LENGTH ? `${text.slice(0, SUMMARY_MAX_LENGTH - 1).trimEnd()}…` : text;
}

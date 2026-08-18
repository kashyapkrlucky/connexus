import { NewsItemDTO } from "../types/news.types";
import { ApiError } from "../utils/response";

// Google News' public RSS feed — no API key required.
const FEED_URL = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { items: NewsItemDTO[]; fetchedAt: number } | null = null;

function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function parseFeed(xml: string): NewsItemDTO[] {
    const items: NewsItemDTO[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml))) {
        const block = match[1];
        const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1];
        const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1];
        const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
        const rawSource = block.match(/<source url="[^"]*">([\s\S]*?)<\/source>/)?.[1];
        if (!rawTitle || !link || !pubDate) continue;

        const source = rawSource ? decodeEntities(rawSource) : "Unknown";
        let title = decodeEntities(rawTitle);
        const suffix = ` - ${source}`;
        if (source !== "Unknown" && title.endsWith(suffix)) {
            title = title.slice(0, -suffix.length);
        }

        const publishedAt = new Date(pubDate);
        if (Number.isNaN(publishedAt.getTime())) continue;

        items.push({ title, url: link.trim(), source, publishedAt: publishedAt.toISOString() });
    }

    return items;
}

export class NewsService {
    static async getTopHeadlines(limit = 5): Promise<NewsItemDTO[]> {
        if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
            return cache.items.slice(0, limit);
        }

        let response: Response;
        try {
            response = await fetch(FEED_URL, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; ConnexusBot/1.0)" },
            });
        } catch {
            if (cache) return cache.items.slice(0, limit);
            throw new ApiError("Couldn't load news right now", 502);
        }

        if (!response.ok) {
            if (cache) return cache.items.slice(0, limit);
            throw new ApiError("Couldn't load news right now", 502);
        }

        const xml = await response.text();
        const items = parseFeed(xml);
        cache = { items, fetchedAt: Date.now() };
        return items.slice(0, limit);
    }
}

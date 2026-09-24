import type { FeedItem } from "./sources";

const USER_AGENT = "Mozilla/5.0 (compatible; ConnexusBot/1.0)";
const MAX_HTML_BYTES = 512 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Aggregator links (Google News redirects) have no image of the article itself.
const SKIP_PAGE_HOSTS = new Set(["news.google.com", "news.ycombinator.com"]);
// dev.to's og:image for an article without a cover is an auto-generated title card
// that repeats (and often clips) the title, so only its real cover is used.
const DEVTO_HOST = "dev.to";

/**
 * Picks an image for a curated post: the source's own cover, else the article's
 * og:image, else an image embedded in the feed. Every candidate is checked to
 * actually serve an image, so posts never show a broken one.
 */
export async function resolvePostImage(item: FeedItem): Promise<string | null> {
    if (isDevToArticle(item.url)) {
        const cover = preferNativeCrop(toSafeUrl(item.coverImageUrl ?? (await findDevToCover(item.url).catch(() => undefined))));
        return cover && (await isReachableImage(cover)) ? cover : null;
    }

    const candidates: (() => Promise<string | undefined>)[] = [
        async () => item.coverImageUrl,
        () => findPageImage(item.url),
        async () => item.thumbnailUrl,
    ];

    for (const candidate of candidates) {
        const url = preferNativeCrop(toSafeUrl(await candidate().catch(() => undefined)));
        if (url && (await isReachableImage(url))) return url;
    }
    return null;
}

/**
 * dev.to's og:image asks its CDN for a 1200×627 crop, which cuts the edges off covers
 * designed at dev.to's native 1000×420. Request the native size instead.
 */
export function preferNativeCrop(url: string | null): string | null {
    if (!url || !url.startsWith("https://media2.dev.to/dynamic/image/")) return url;
    return url.replace("width=1200,height=627", "width=1000,height=420");
}

/** https only, public hostnames only — the bot fetches URLs taken from third-party feeds. */
function toSafeUrl(raw: string | undefined, base?: string): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw.trim(), base);
        if (url.protocol === "http:") url.protocol = "https:";
        if (url.protocol !== "https:") return null;
        const host = url.hostname;
        if (host === "localhost" || !host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":")) return null;
        return url.toString();
    } catch {
        return null;
    }
}

function isDevToArticle(url: string): boolean {
    try {
        return new URL(url).hostname === DEVTO_HOST;
    } catch {
        return false;
    }
}

/** The article's real cover from dev.to's API (null when the author didn't set one). */
async function findDevToCover(articleUrl: string): Promise<string | undefined> {
    const path = new URL(articleUrl).pathname.replace(/^\/|\/$/g, "");
    const res = await fetch(`https://dev.to/api/articles/${path}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return undefined;
    const { cover_image } = (await res.json()) as { cover_image: string | null };
    return cover_image ?? undefined;
}

async function findPageImage(pageUrl: string): Promise<string | undefined> {
    const safeUrl = toSafeUrl(pageUrl);
    if (!safeUrl || SKIP_PAGE_HOSTS.has(new URL(safeUrl).hostname)) return undefined;

    const res = await fetch(safeUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
        signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok || !res.body || !res.headers.get("content-type")?.includes("html")) return undefined;

    const html = await readHead(res.body);
    const meta = (key: string) =>
        html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"))?.[1] ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"))?.[1];

    const found = meta("og:image:secure_url") ?? meta("og:image") ?? meta("twitter:image");
    // Resolve relative URLs against the final (post-redirect) page URL.
    return toSafeUrl(found?.replace(/&amp;/g, "&"), res.url || safeUrl) ?? undefined;
}

/** Reads the page only up to </head> (or a size cap); meta tags live there. */
async function readHead(body: ReadableStream<Uint8Array>): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    try {
        while (html.length < MAX_HTML_BYTES) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
            if (html.includes("</head>")) break;
        }
    } finally {
        await reader.cancel().catch(() => {});
    }
    return html;
}

async function isReachableImage(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6_000) });
        await res.body?.cancel().catch(() => {});
        const type = res.headers.get("content-type") ?? "";
        const size = Number(res.headers.get("content-length") ?? 0);
        return res.ok && type.startsWith("image/") && !type.includes("svg") && size <= MAX_IMAGE_BYTES;
    } catch {
        return false;
    }
}

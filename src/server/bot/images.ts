import type { FeedItem } from "./sources";

const USER_AGENT = "Mozilla/5.0 (compatible; ConnexusBot/1.0)";
const MAX_HTML_BYTES = 512 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Aggregator links (Google News redirects) have no image of the article itself.
const SKIP_PAGE_HOSTS = new Set(["news.google.com", "news.ycombinator.com"]);

/**
 * Picks an image for a curated post: the source's own cover, else the article's
 * og:image, else an image embedded in the feed. Every candidate is checked to
 * actually serve an image, so posts never show a broken one.
 */
export async function resolvePostImage(item: FeedItem): Promise<string | null> {
    const candidates: (() => Promise<string | undefined>)[] = [
        async () => item.coverImageUrl,
        () => findPageImage(item.url),
        async () => item.thumbnailUrl,
    ];

    for (const candidate of candidates) {
        const url = toSafeUrl(await candidate().catch(() => undefined));
        if (url && (await isReachableImage(url))) return url;
    }
    return null;
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
    return toSafeUrl(found?.replace(/&amp;/g, "&"), res.url) ?? undefined;
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

import { createHash } from "crypto";
import { getCurrentUserId } from "@/features/auth/server";

/**
 * Stable per-viewer identifier for de-duplicating views/shares: the user id when
 * signed in, otherwise a salted hash of IP + user agent (never stored raw).
 */
export async function getViewerKey(req: Request): Promise<string> {
    const userId = await getCurrentUserId();
    if (userId) return `user:${userId}`;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") ?? "";
    const hash = createHash("sha256").update(`${ip}|${userAgent}|${process.env.AUTH_SECRET}`).digest("hex");
    return `anon:${hash.slice(0, 32)}`;
}

import { prisma } from "@/infra/db/connect";
import { ApiError } from "./response";

/** Per-user limits for write actions: at most `limit` requests per `windowSeconds`. */
export const RATE_LIMITS = {
  post: { limit: 5, windowSeconds: 10 * 60, noun: "posts" },
  comment: { limit: 20, windowSeconds: 5 * 60, noun: "comments" },
  vote: { limit: 60, windowSeconds: 60, noun: "votes" },
  community: { limit: 3, windowSeconds: 60 * 60, noun: "communities" },
  upload: { limit: 20, windowSeconds: 10 * 60, noun: "uploads" },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Fixed-window counter in Postgres: one atomic upsert per request, so it holds across
 * serverless instances without Redis. Throws a 429 ApiError (with Retry-After) once
 * the user exceeds the action's limit.
 */
export async function enforceRateLimit(action: RateLimitAction, userId: string): Promise<void> {
  const { limit, windowSeconds, noun } = RATE_LIMITS[action];
  const key = `${action}:${userId}`;

  const [bucket] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO rate_limits (key, count, "resetAt")
    VALUES (${key}, 1, now() + ${windowSeconds}::integer * interval '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits."resetAt" <= now() THEN 1 ELSE rate_limits.count + 1 END,
      "resetAt" = CASE WHEN rate_limits."resetAt" <= now()
        THEN now() + ${windowSeconds}::integer * interval '1 second'
        ELSE rate_limits."resetAt" END
    RETURNING count, "resetAt"`;

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000));
    throw new ApiError(`You're doing that too often: ${limit} ${noun} per ${describeWindow(windowSeconds)}. Try again ${describeWait(retryAfter)}.`, 429, retryAfter);
  }
}

function describeWindow(seconds: number): string {
  if (seconds % 3600 === 0) return seconds === 3600 ? "hour" : `${seconds / 3600} hours`;
  if (seconds % 60 === 0) return seconds === 60 ? "minute" : `${seconds / 60} minutes`;
  return `${seconds} seconds`;
}

function describeWait(seconds: number): string {
  if (seconds < 60) return `in ${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

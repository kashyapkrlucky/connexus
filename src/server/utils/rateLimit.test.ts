import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.hoisted(() => vi.fn());
vi.mock("@/infra/db/connect", () => ({ prisma: { $queryRaw: queryRaw } }));

const { enforceRateLimit, RATE_LIMITS } = await import("./rateLimit");
const { ApiError, handleApiError } = await import("./response");

const bucket = (count: number, secondsLeft: number) => [{ count, resetAt: new Date(Date.now() + secondsLeft * 1000) }];

beforeEach(() => queryRaw.mockReset());

describe("enforceRateLimit", () => {
  it("allows requests up to the limit", async () => {
    queryRaw.mockResolvedValue(bucket(RATE_LIMITS.post.limit, 300));
    await expect(enforceRateLimit("post", "user-1")).resolves.toBeUndefined();
  });

  it("keys the counter by action and user", async () => {
    queryRaw.mockResolvedValue(bucket(1, 60));
    await enforceRateLimit("vote", "user-42");
    const [, key] = queryRaw.mock.calls[0];
    expect(key).toBe("vote:user-42");
  });

  it("rejects the request after the limit with a 429 and Retry-After", async () => {
    queryRaw.mockResolvedValue(bucket(RATE_LIMITS.post.limit + 1, 125));
    const error = await enforceRateLimit("post", "user-1").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBeGreaterThanOrEqual(124);
    expect(error.message).toBe("You're doing that too often: 5 posts per 10 minutes. Try again in 3 minutes.");
  });

  it("describes short waits in seconds", async () => {
    queryRaw.mockResolvedValue(bucket(RATE_LIMITS.vote.limit + 1, 9));
    const error = await enforceRateLimit("vote", "user-1").catch((e) => e);
    expect(error.message).toMatch(/60 votes per minute\. Try again in \d+ seconds\.$/);
  });
});

describe("handleApiError", () => {
  it("sends Retry-After for rate-limited requests", async () => {
    const res = handleApiError(new ApiError("slow down", 429, 30));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect(await res.json()).toEqual({ error: "slow down" });
  });

  it("omits Retry-After for other errors", () => {
    expect(handleApiError(new ApiError("nope", 403)).headers.get("Retry-After")).toBeNull();
  });
});

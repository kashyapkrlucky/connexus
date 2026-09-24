import { describe, expect, it } from "vitest";
import { HOT_SCORE_EPOCH } from "@/shared/constants";
import { computeHotScore } from "./hotScore";
import { getRankForXp, RANK_TIERS } from "./rank";
import { slugify } from "./slugify";
import { voteDelta } from "@/shared/utils/vote";

describe("computeHotScore", () => {
  const now = new Date(HOT_SCORE_EPOCH + 1000 * 24 * 60 * 60 * 1000);

  it("ranks a newer post above an older one with the same score", () => {
    const older = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    expect(computeHotScore(10, now)).toBeGreaterThan(computeHotScore(10, older));
  });

  it("ranks a higher score above a lower one at the same age", () => {
    expect(computeHotScore(100, now)).toBeGreaterThan(computeHotScore(10, now));
  });

  it("uses a log scale, so 10x the votes is worth a fixed time bonus (12.5h)", () => {
    const gain = computeHotScore(100, now) - computeHotScore(10, now);
    expect(gain).toBeCloseTo(1, 5);
    const twelveAndAHalfHours = 45_000 * 1000;
    expect(computeHotScore(10, new Date(now.getTime() + twelveAndAHalfHours)) - computeHotScore(10, now)).toBeCloseTo(1, 5);
  });

  it("pushes negative scores down", () => {
    expect(computeHotScore(-10, now)).toBeLessThan(computeHotScore(0, now));
  });
});

describe("getRankForXp", () => {
  it("starts everyone as a Newcomer with progress toward Contributor", () => {
    const rank = getRankForXp(150);
    expect(rank).toMatchObject({ name: "Newcomer", level: 1, nextRank: { name: "Contributor", minXp: 300 } });
    expect(rank.progress).toBeCloseTo(0.5);
  });

  it("promotes exactly at each tier threshold", () => {
    for (const [i, tier] of RANK_TIERS.entries()) {
      expect(getRankForXp(tier.minXp)).toMatchObject({ name: tier.name, level: i + 1 });
      if (tier.minXp > 0) expect(getRankForXp(tier.minXp - 1).level).toBe(i);
    }
  });

  it("caps at Mythic with full progress", () => {
    expect(getRankForXp(1_000_000)).toMatchObject({ name: "Mythic", nextRank: null, progress: 1 });
  });
});

describe("slugify", () => {
  it.each([
    ["Frontend Founders", "frontend-founders"],
    ["  C++ & Rust!!  ", "c-rust"],
    ["multiple   spaces --- dashes", "multiple-spaces-dashes"],
    ["Ünïcode only ✨", "ncode-only"],
    ["!!!", ""],
  ])("%j -> %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("voteDelta", () => {
  it.each([
    [null, "UP", 1],
    [null, "DOWN", -1],
    ["UP", "NONE", -1],
    ["UP", "DOWN", -2],
    ["DOWN", "UP", 2],
    ["DOWN", "NONE", 1],
    ["UP", "UP", 0],
  ] as const)("%s -> %s changes the score by %i", (prev, next, delta) => {
    expect(voteDelta(prev, next)).toBe(delta);
  });
});

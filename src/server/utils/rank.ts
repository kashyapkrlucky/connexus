export const XP_WEIGHTS = {
  post: 10,
  comment: 5,
  communityCreated: 50,
  vote: 1,
} as const;

export interface RankTier {
  name: string;
  minXp: number;
  /** Matches a key in the frontend's RANK_COLOR_CLASSES map — keep the two in sync. */
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: "Newcomer", minXp: 0, color: "gray" },
  { name: "Contributor", minXp: 300, color: "emerald" },
  { name: "Explorer", minXp: 1000, color: "sky" },
  { name: "Pathfinder", minXp: 2000, color: "brand" },
  { name: "Trailblazer", minXp: 4000, color: "orange" },
  { name: "Luminary", minXp: 8000, color: "amber" },
  { name: "Legend", minXp: 16000, color: "rose" },
  { name: "Mythic", minXp: 30000, color: "brand" },
];

export interface RankInfo {
  name: string;
  color: string;
  level: number;
  minXp: number;
  nextRank: { name: string; minXp: number } | null;
  progress: number;
}

export function getRankForXp(xp: number): RankInfo {
  let currentIndex = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].minXp) currentIndex = i;
  }

  const current = RANK_TIERS[currentIndex];
  const next = RANK_TIERS[currentIndex + 1] ?? null;
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;

  return {
    name: current.name,
    color: current.color,
    level: currentIndex + 1,
    minXp: current.minXp,
    nextRank: next ? { name: next.name, minXp: next.minXp } : null,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

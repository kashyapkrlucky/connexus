import { Shield } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { UserRankDTO } from "@/server/types/user.types";

// Keys here must match the `color` values produced by src/server/utils/rank.ts.
const RANK_COLOR_CLASSES: Record<string, { text: string; bg: string; ring: string; bar: string }> = {
  gray: { text: "text-gray-300", bg: "bg-gray-500/15", ring: "ring-gray-500/30", bar: "bg-gray-400" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/30", bar: "bg-emerald-400" },
  sky: { text: "text-sky-400", bg: "bg-sky-500/15", ring: "ring-sky-500/30", bar: "bg-sky-400" },
  brand: { text: "text-brand-400", bg: "bg-brand-500/15", ring: "ring-brand-500/30", bar: "bg-brand-400" },
  orange: { text: "text-orange-400", bg: "bg-orange-500/15", ring: "ring-orange-500/30", bar: "bg-orange-400" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/30", bar: "bg-amber-400" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/15", ring: "ring-rose-500/30", bar: "bg-rose-400" },
};

interface RankBadgeProps {
  rank: UserRankDTO;
  xp: number;
  size?: "sm" | "md";
}

export function RankBadge({ rank, xp, size = "md" }: RankBadgeProps) {
  const colors = RANK_COLOR_CLASSES[rank.color] ?? RANK_COLOR_CLASSES.gray;
  const iconWrapSize = size === "sm" ? "size-8" : "size-10";
  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full ring-2",
          colors.bg,
          colors.ring,
          iconWrapSize
        )}
      >
        <Shield className={cn(colors.text, iconSize)} fill="currentColor" fillOpacity={0.15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("truncate text-sm font-semibold", colors.text)}>{rank.name}</p>
          <p className="shrink-0 text-xs text-gray-500">{xp.toLocaleString()} XP</p>
        </div>
        {rank.nextRank && (
          <div className="mt-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={cn("h-full rounded-full transition-all", colors.bar)}
                style={{ width: `${rank.progress * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              {(rank.nextRank.minXp - xp).toLocaleString()} XP to {rank.nextRank.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

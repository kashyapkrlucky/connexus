import { TrophyIcon } from "lucide-react";
import type { UserScoreDTO } from "@/server/types/user.types";
import { RankBadge } from "@/shared/components/ui/RankBadge";

export function ProfileRankCard({ score }: { score: UserScoreDTO }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <TrophyIcon className="size-3.5" /> Your rank
      </h2>
      <RankBadge rank={score.rank} xp={score.xp} size="sm" />
    </div>
  );
}

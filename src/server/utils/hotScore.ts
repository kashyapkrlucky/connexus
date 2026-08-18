import { HOT_SCORE_EPOCH } from "@/shared/constants";

export function computeHotScore(score: number, createdAt: Date): number {
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (createdAt.getTime() - HOT_SCORE_EPOCH) / 1000;
  return sign * order + seconds / 45000;
}

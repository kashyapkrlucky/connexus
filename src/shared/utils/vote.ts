type VoteState = "UP" | "DOWN" | null;
type VoteAction = "UP" | "DOWN" | "NONE";

export function voteDelta(prev: VoteState, next: VoteAction): number {
  const prevNum = prev === "UP" ? 1 : prev === "DOWN" ? -1 : 0;
  const nextNum = next === "UP" ? 1 : next === "DOWN" ? -1 : 0;
  return nextNum - prevNum;
}

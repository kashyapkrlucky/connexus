import { cn } from "@/shared/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-size-[200%_100%]",
        className
      )}
    />
  );
}

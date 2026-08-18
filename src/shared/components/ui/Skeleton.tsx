import { cn } from "@/shared/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 bg-size-[200%_100%]",
        className
      )}
    />
  );
}

import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type Tone = "neutral" | "brand" | "green" | "red" | "blue";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-gray-800 text-gray-300",
  brand: "bg-brand-500/15 text-brand-400",
  green: "bg-emerald-500/15 text-emerald-400",
  red: "bg-red-500/15 text-red-400",
  blue: "bg-blue-500/15 text-blue-400",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

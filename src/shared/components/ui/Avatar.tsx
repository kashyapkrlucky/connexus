import Image from "next/image";
import { cn } from "@/shared/utils/cn";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover ring-1 ring-black/5", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 font-semibold text-white ring-1 ring-black/5",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}

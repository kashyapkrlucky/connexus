import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cyan-600 text-white shadow-sm shadow-cyan-600/20 hover:bg-cyan-700 hover:shadow-cyan-600/30 disabled:bg-cyan-300 disabled:shadow-none",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 disabled:opacity-50",
  ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 disabled:bg-red-300 disabled:shadow-none",
  outline:
    "bg-white border border-neutral-200 text-neutral-800 shadow-xs hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2 rounded-xl gap-2",
  lg: "text-base px-5 py-2.5 rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

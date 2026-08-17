import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-sm text-gray-200 outline-none transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

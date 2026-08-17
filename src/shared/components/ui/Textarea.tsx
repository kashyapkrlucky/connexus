import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-2.5 text-sm text-gray-200 outline-none transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

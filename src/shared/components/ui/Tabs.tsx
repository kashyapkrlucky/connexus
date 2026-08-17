"use client";

import { cn } from "@/shared/utils/cn";

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-gray-800 bg-gray-900/70 p-1",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
            value === item.value
              ? "bg-gray-700 text-gray-200 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          )}  
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

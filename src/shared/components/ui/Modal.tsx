"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 p-4 backdrop-blur-sm">
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        className={cn(
          "animate-modal-in relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-2xl shadow-neutral-900/10",
          className
        )}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

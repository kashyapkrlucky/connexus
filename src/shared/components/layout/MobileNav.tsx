"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, X } from "lucide-react";
import { SideBar } from "./SideBar";

/** Hamburger + slide-over drawer holding the SideBar on screens below `lg`. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close whenever the user navigates somewhere from the drawer.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="-ml-1 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-800 hover:text-gray-100 lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            aria-label="Close navigation"
            className="animate-overlay-in absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border/40 bg-surface">
            <div className="flex justify-end p-2 pb-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <SideBar className="w-full border-r-0" />
          </div>
        </div>
      )}
    </>
  );
}

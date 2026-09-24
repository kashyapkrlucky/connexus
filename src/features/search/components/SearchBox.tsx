"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, SearchIcon } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import { SearchResultList } from "./SearchResultList";

/** Top-bar search with a live dropdown; Enter opens the full /search page. */
export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading, isEmpty } = useSearch(query);

  // Close the dropdown whenever the route changes.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const showDropdown = open && query.trim().length > 0 && (results || loading);

  return (
    <div ref={containerRef} className="relative hidden w-full max-w-sm md:block">
      <form role="search" onSubmit={handleSubmit}>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search communities, people, posts"
          aria-label="Search"
          className="w-full rounded-lg border border-border/40 bg-background py-1.5 pl-9 pr-8 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-foreground/40" />
        )}
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-1.5 shadow-lg shadow-black/40">
          {isEmpty ? (
            <p className="px-3 py-4 text-center text-sm text-gray-500">No results for “{query.trim()}”</p>
          ) : (
            results && <SearchResultList results={results} compact onNavigate={() => setOpen(false)} />
          )}
          {results && !isEmpty && (
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-1 w-full rounded-xl px-3 py-2 text-center text-xs font-medium text-brand-400 hover:bg-gray-800"
            >
              See all results for “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}

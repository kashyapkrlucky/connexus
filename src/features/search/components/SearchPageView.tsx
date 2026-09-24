"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, SearchXIcon } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { useSearch } from "../hooks/useSearch";
import { SearchResultList } from "./SearchResultList";

export function SearchPageView({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const { results, loading, isEmpty } = useSearch(query);

  const handleChange = (value: string) => {
    setQuery(value);
    // Keep the URL shareable without adding a history entry per keystroke.
    router.replace(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search", { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          autoFocus
          placeholder="Search communities, people, posts"
          aria-label="Search"
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-base text-gray-100 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none"
        />
      </form>

      {!query.trim() ? (
        <EmptyState icon={SearchIcon} title="Search Connexus" description="Find communities, people and posts." />
      ) : loading && !results ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState icon={SearchXIcon} title={`No results for “${query.trim()}”`} description="Try a different word or a shorter search." />
      ) : (
        results && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-1.5">
            <SearchResultList results={results} />
          </div>
        )
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import internalApi from "@/lib/http/internal";
import type { SearchResultsDTO } from "@/server/services/SearchService";

const DEBOUNCE_MS = 250;

/** Debounced search across communities, users and posts; stale responses are discarded. */
export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResultsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const q = query.trim();

  useEffect(() => {
    if (!q) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await internalApi.get<SearchResultsDTO>("/v1/search", {
          params: { q },
          signal: controller.signal,
        });
        setResults(data);
      } catch {
        if (!controller.signal.aborted) setResults(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const hasQuery = q.length > 0;
  const visible = hasQuery ? results : null;
  const isEmpty = !!visible && !visible.communities.length && !visible.users.length && !visible.posts.length;

  return { results: visible, loading: hasQuery && loading, isEmpty };
}

import type { Metadata } from "next";
import { SearchPageView } from "@/features/search/components/SearchPageView";

export const metadata: Metadata = { title: "Search · Connexus" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-200">Search</h1>
      <SearchPageView initialQuery={initialQuery} />
    </div>
  );
}

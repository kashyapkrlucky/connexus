import type { Metadata } from "next";
import { SearchPageView } from "@/features/search/components/SearchPageView";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Search" />
      <SearchPageView initialQuery={initialQuery} />
    </div>
  );
}

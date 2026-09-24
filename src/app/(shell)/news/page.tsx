import type { Metadata } from "next";
import { NewsView } from "@/features/sidebar/components/NewsView";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "What's happening",
  description: "Top world headlines, refreshed throughout the day.",
};

export default function NewsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="What's happening" description="Top world headlines, refreshed throughout the day." />
      <NewsView />
    </div>
  );
}

import type { Metadata } from "next";
import { ExploreView } from "@/features/sidebar/components/ExploreView";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Explore communities",
  description: "Discover trending communities and new ones to join on Connexus.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Explore" description="Find communities to join — what's active today and what you haven't tried yet." />
      <ExploreView />
    </div>
  );
}

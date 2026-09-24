import type { Metadata } from "next";
import { ExploreView } from "@/features/sidebar/components/ExploreView";

export const metadata: Metadata = {
  title: "Explore communities",
  description: "Discover trending communities and new ones to join on Connexus.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-200">Explore</h1>
      <ExploreView />
    </div>
  );
}

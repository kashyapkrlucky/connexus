import { NewsView } from "@/features/sidebar/components/NewsView";

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-200">What&apos;s happening</h1>
      <NewsView />
    </div>
  );
}

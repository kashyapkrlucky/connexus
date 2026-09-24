"use client";

import { TopBar } from "@/shared/components/layout/TopBar";
import { ErrorContent } from "@/shared/components/layout/ErrorContent";

export default function RootError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <ErrorContent {...props} />
    </div>
  );
}

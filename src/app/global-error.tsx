"use client";

import "@/styles/globals.css";
import { ErrorContent } from "@/shared/components/layout/ErrorContent";

// Replaces the root layout when it crashes, so it renders its own document.
export default function GlobalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>Something went wrong · Connexus</title>
        <ErrorContent {...props} />
      </body>
    </html>
  );
}

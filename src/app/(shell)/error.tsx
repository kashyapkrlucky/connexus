"use client";

import { ErrorContent } from "@/shared/components/layout/ErrorContent";

export default function ShellError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorContent {...props} />;
}

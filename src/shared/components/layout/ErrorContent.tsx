"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { StatusPage, statusLinkClass } from "./StatusPage";

interface ErrorContentProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export function ErrorContent({ error, retry }: ErrorContentProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={TriangleAlertIcon}
      title="Something went wrong"
      description={
        error.digest
          ? `An unexpected error occurred. If it keeps happening, mention reference ${error.digest} when reporting it.`
          : "An unexpected error occurred. Try again, or head back home."
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => retry()}
            className={`${statusLinkClass} cursor-pointer bg-brand-500 text-white hover:bg-brand-600`}
          >
            <RotateCcwIcon className="size-4" /> Try again
          </button>
          <Link href="/" className={`${statusLinkClass} border border-gray-700 text-gray-300 hover:bg-gray-800`}>
            Back to home
          </Link>
        </>
      }
    />
  );
}

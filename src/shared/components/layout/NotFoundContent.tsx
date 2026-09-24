import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { StatusPage, statusLinkClass } from "./StatusPage";

export function NotFoundContent() {
  return (
    <StatusPage
      icon={CompassIcon}
      code="404"
      title="This page wandered off"
      description="The page you're looking for doesn't exist, was deleted, or is in a private community."
      actions={
        <>
          <Link href="/" className={`${statusLinkClass} bg-brand-500 text-white hover:bg-brand-600`}>
            Back to home
          </Link>
          <Link href="/explore" className={`${statusLinkClass} border border-gray-700 text-gray-300 hover:bg-gray-800`}>
            Explore communities
          </Link>
        </>
      }
    />
  );
}

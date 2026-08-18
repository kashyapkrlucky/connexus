import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-200">Support</h1>
      <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-sm leading-relaxed text-gray-400">
        <p>Running into a problem or have feedback? Here&apos;s where to start:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Check the{" "}
            <Link href="/help" className="text-brand-400 hover:text-brand-300">
              Help Center
            </Link>{" "}
            for answers to common questions.
          </li>
          <li>If a post or comment breaks a community&apos;s guidelines, report it to that community&apos;s moderators.</li>
          <li>For account or platform issues, reach out through your workspace administrator.</li>
        </ul>
      </div>
    </div>
  );
}

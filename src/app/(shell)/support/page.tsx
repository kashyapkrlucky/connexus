import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon, BugIcon, LightbulbIcon, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export const metadata: Metadata = { title: "Support" };

const REPO_URL = "https://github.com/kashyapkrlucky/connexus";

const OPTIONS: { icon: LucideIcon; title: string; body: string; href: string; cta: string; external?: boolean }[] = [
  {
    icon: BookOpenIcon,
    title: "Browse the Help Center",
    body: "Answers to common questions about communities, voting, XP and the bot.",
    href: "/help",
    cta: "Open Help Center",
  },
  {
    icon: BugIcon,
    title: "Report a bug",
    body: "Something broken? Open an issue with what you did, what you expected and what happened.",
    href: `${REPO_URL}/issues/new?labels=bug`,
    cta: "Report on GitHub",
    external: true,
  },
  {
    icon: LightbulbIcon,
    title: "Suggest a feature",
    body: "Have an idea that would make Connexus better? Share it as a feature request.",
    href: `${REPO_URL}/issues/new?labels=enhancement`,
    cta: "Suggest on GitHub",
    external: true,
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Support" description="Running into a problem or have feedback? Here's where to go." />

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ icon: Icon, title, body, href, cta, external }) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
              <p className="mt-1 text-sm text-gray-400">{body}</p>
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-brand-400 hover:text-brand-300">
                  {cta} ↗
                </a>
              ) : (
                <Link href={href} className="mt-2 inline-block text-sm font-medium text-brand-400 hover:text-brand-300">
                  {cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Problem with a specific post or comment? Community owners and moderators can remove content that breaks their
        community&apos;s guidelines.
      </p>
    </div>
  );
}

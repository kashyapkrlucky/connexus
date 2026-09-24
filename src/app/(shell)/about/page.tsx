import type { Metadata } from "next";
import Link from "next/link";
import { BotIcon, ShieldCheckIcon, TrophyIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { RANK_TIERS, XP_WEIGHTS } from "@/server/utils/rank";
import { RANK_COLOR_CLASSES } from "@/shared/components/ui/RankBadge";
import { cn } from "@/shared/utils/cn";

export const metadata: Metadata = { title: "About · Connexus" };

const PILLARS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UsersIcon,
    title: "Communities first",
    body: "Public or private spaces with their own owners, moderators, guidelines and member lists.",
  },
  {
    icon: BotIcon,
    title: "Always something new",
    body: "The Connexus bot shares fresh news and articles to each community around the clock, always linking the source.",
  },
  {
    icon: TrophyIcon,
    title: "Contribution is rewarded",
    body: "Posting, commenting, voting and starting communities earns XP that moves you up the ranks.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Fair by design",
    body: "Votes, views and shares count once per person, so rankings reflect real interest rather than refresh spam.",
  },
];

const XP_RULES = [
  { label: "Create a community", xp: XP_WEIGHTS.communityCreated },
  { label: "Write a post", xp: XP_WEIGHTS.post },
  { label: "Leave a comment", xp: XP_WEIGHTS.comment },
  { label: "Cast a vote", xp: XP_WEIGHTS.vote },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-200">About Connexus</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Connexus is a place to build and join communities around the things you care about: start a community,
          share posts, discuss with people who get it, and vote on what matters.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
              <Icon className="size-4" />
            </div>
            <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-200">Earning XP</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {XP_RULES.map((rule) => (
            <li key={rule.label} className="rounded-xl bg-gray-950/50 px-3 py-2">
              <p className="text-lg font-semibold text-gray-100">+{rule.xp}</p>
              <p className="text-xs text-gray-500">{rule.label}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-5 text-sm font-semibold text-gray-200">The rank ladder</h2>
        <ol className="mt-3 flex flex-wrap gap-2">
          {RANK_TIERS.map((tier, i) => {
            const colors = RANK_COLOR_CLASSES[tier.color] ?? RANK_COLOR_CLASSES.gray;
            return (
              <li key={tier.name} className={cn("rounded-full px-3 py-1 text-xs font-medium ring-1", colors.bg, colors.text, colors.ring)}>
                {i + 1}. {tier.name} <span className="opacity-60">· {tier.minXp.toLocaleString()} XP</span>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="text-sm text-gray-500">
        Questions? Visit the{" "}
        <Link href="/help" className="text-brand-400 hover:text-brand-300">
          Help Center
        </Link>
        . Curious how it&apos;s built? The source is on{" "}
        <a href="https://github.com/kashyapkrlucky/connexus" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300">
          GitHub
        </a>
        .
      </p>
    </div>
  );
}

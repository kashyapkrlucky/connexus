import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";

export const metadata: Metadata = { title: "Help" };

const SECTIONS: { title: string; faqs: { question: string; answer: React.ReactNode }[] }[] = [
  {
    title: "Getting started",
    faqs: [
      {
        question: "How do I sign in?",
        answer: "Click Login in the top bar and continue with your Google account. You can browse public communities without signing in.",
      },
      {
        question: "How do I join a community?",
        answer:
          "Open a community's page and click Join. Anyone can join a public community; private communities need an invite from an owner or moderator.",
      },
      {
        question: "How do I create a community?",
        answer: "Click the + next to My Communities in the sidebar, then choose a name, description and visibility.",
      },
    ],
  },
  {
    title: "Posts, votes and ranking",
    faqs: [
      {
        question: "How does voting work?",
        answer:
          "Upvote posts and comments that add value and downvote ones that don't. Each person gets one vote per post or comment, and the net score decides how it ranks.",
      },
      {
        question: "What do Hot, Top, New and Most Viewed mean?",
        answer:
          "Hot balances score with freshness, so new posts with early votes rise. Top is by score, New is by time, and Most Viewed is by unique views.",
      },
      {
        question: "Can I delete my posts and comments?",
        answer:
          "Yes, you can delete your own posts and comments at any time. Community owners and moderators can also remove content that breaks their guidelines.",
      },
    ],
  },
  {
    title: "XP, ranks and the bot",
    faqs: [
      {
        question: "What are XP and ranks?",
        answer: (
          <>
            You earn XP for posting, commenting, voting and creating communities. As it grows you climb eight ranks,
            from Newcomer to Mythic. See the full ladder on the{" "}
            <Link href="/about" className="text-brand-400 hover:text-brand-300">
              About page
            </Link>
            .
          </>
        ),
      },
      {
        question: "Who is u/connexus-bot?",
        answer:
          "It's our curator bot. Throughout the day it picks a relevant news story or article for each community, writes a short summary and a discussion question, and always links the original source. Its posts carry a bot badge.",
      },
      {
        question: "Where can community owners see analytics?",
        answer:
          "Owners and moderators see an Analytics button on their community's page, with live totals and 30-day trends for members and posts.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Help Center" description="Answers to common questions about Connexus." />

      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</h2>
          <div className="divide-y divide-gray-800 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            {section.faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-gray-800/50 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDownIcon className="size-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-gray-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm text-gray-500">
        Still stuck?{" "}
        <Link href="/support" className="text-brand-400 hover:text-brand-300">
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}

const FAQS = [
  {
    question: "How do I join a community?",
    answer:
      "Visit a community's page and click Join. Public communities let anyone join instantly; private communities need an invite from a moderator.",
  },
  {
    question: "How does voting work?",
    answer:
      "Upvote posts and comments you think add value, downvote ones that don't. The net score affects how a post or comment ranks.",
  },
  {
    question: "What are XP and ranks?",
    answer:
      "You earn XP for posting, commenting, voting, and creating communities. As your XP grows, you move up through ranks shown on your profile.",
  },
  {
    question: "Can I edit or delete my posts and comments?",
    answer:
      "You can delete your own posts and comments at any time. Community owners and moderators can also remove content that breaks their guidelines.",
  },
  {
    question: "How do I create a community?",
    answer: "Click the + next to My Communities in the sidebar.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-200">Help Center</h1>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-sm font-semibold text-gray-200">{faq.question}</h2>
            <p className="mt-1.5 text-sm text-gray-400">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

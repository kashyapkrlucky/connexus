import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommunityForPage } from "@/server/pageData";
import { CommunityPageView } from "@/features/community/components/CommunityPageView";
import { toExcerpt } from "@/shared/constants/site";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CommunityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityForPage(slug);
  if (!community) return { title: "Community not found", robots: { index: false } };

  const description =
    toExcerpt(community.description) ?? `Join c/${community.slug} on Connexus.`;
  return {
    title: `${community.name} (c/${community.slug})`,
    description,
    alternates: { canonical: `/c/${community.slug}` },
    robots: community.visibility === "PRIVATE" ? { index: false, follow: false } : undefined,
    openGraph: { title: `c/${community.slug}`, description },
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;
  if (!(await getCommunityForPage(slug))) notFound();
  return <CommunityPageView slug={slug} />;
}

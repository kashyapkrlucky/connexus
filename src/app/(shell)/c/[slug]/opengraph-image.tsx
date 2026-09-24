import { OG_SIZE, renderOgCard } from "@/server/og/card";
import { CommunityService } from "@/server/services/CommunityService";
import { toExcerpt } from "@/shared/constants/site";

export const alt = "Connexus community";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await CommunityService.getCommunityBySlug(slug, null);
  if (!community) return renderOgCard({ title: "A community on Connexus" });

  return renderOgCard({
    eyebrow: "Community",
    title: `c/${community.slug}`,
    description: toExcerpt(community.description, 150),
    footer: `${community.memberCount} members · ${community.postCount} posts`,
  });
}

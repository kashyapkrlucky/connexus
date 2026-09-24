import { OG_SIZE, renderOgCard } from "@/server/og/card";
import { PostService } from "@/server/services/PostService";
import { toExcerpt } from "@/shared/constants/site";

export const alt = "Connexus post";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // No viewer here: posts in private communities fall back to the generic card.
  const post = await PostService.getPostById(id, null);
  if (!post) return renderOgCard({ title: "A post on Connexus" });

  return renderOgCard({
    eyebrow: `c/${post.community.slug}`,
    title: post.title,
    description: toExcerpt(post.content, 150),
    footer: `u/${post.author.username} · ${post.score} points · ${post.commentCount} comments`,
  });
}

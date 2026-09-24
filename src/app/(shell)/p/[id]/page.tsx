import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostForPage } from "@/server/pageData";
import { PostPageView } from "@/features/post/components/PostPageView";
import { toExcerpt } from "@/shared/constants/site";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostForPage(id);
  if (!post) return { title: "Post not found", robots: { index: false } };

  const description = toExcerpt(post.content) ?? `A post in c/${post.community.slug}`;
  return {
    title: `${post.title} · c/${post.community.slug}`,
    description,
    alternates: { canonical: `/p/${post.id}` },
    robots: post.community.visibility === "PRIVATE" ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.createdAt,
      authors: [`u/${post.author.username}`],
      section: `c/${post.community.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  if (!(await getPostForPage(id))) notFound();
  return <PostPageView id={id} />;
}

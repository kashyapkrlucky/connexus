import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileForPage } from "@/server/pageData";
import { ProfilePageView } from "@/features/profile/components/ProfilePageView";
import { toExcerpt } from "@/shared/constants/site";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileForPage(username);
  if (!profile) return { title: "User not found", robots: { index: false } };

  const description =
    toExcerpt(profile.bio) ??
    `${profile.displayName} on Connexus · ${profile.stats.postCount} posts · ${profile.stats.karma} karma`;
  return {
    title: `${profile.displayName} (u/${profile.username})`,
    description,
    alternates: { canonical: `/u/${profile.username}` },
    openGraph: {
      type: "profile",
      title: `${profile.displayName} (u/${profile.username})`,
      description,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl, alt: profile.displayName }] : undefined,
    },
    twitter: { card: "summary" },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  if (!(await getProfileForPage(username))) notFound();
  return <ProfilePageView username={username} />;
}

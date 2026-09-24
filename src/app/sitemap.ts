import type { MetadataRoute } from "next";
import { prisma } from "@/infra/db/connect";
import { SITE_URL } from "@/shared/constants/site";
import { CommunityVisibility } from "../../generated/prisma/enums";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/popular", "/explore", "/news", "/about", "/help"];
const MAX_POSTS = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" || path === "/popular" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));

  try {
    const [communities, posts] = await Promise.all([
      prisma.communities.findMany({
        where: { visibility: CommunityVisibility.PUBLIC },
        select: { slug: true, createdAt: true },
      }),
      prisma.posts.findMany({
        where: { communities: { visibility: CommunityVisibility.PUBLIC } },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: MAX_POSTS,
      }),
    ]);

    return [
      ...staticEntries,
      ...communities.map((c) => ({
        url: `${SITE_URL}/c/${c.slug}`,
        lastModified: c.createdAt,
        changeFrequency: "hourly" as const,
        priority: 0.8,
      })),
      ...posts.map((p) => ({
        url: `${SITE_URL}/p/${p.id}`,
        lastModified: p.createdAt,
        changeFrequency: "daily" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    // Keep the sitemap valid (e.g. during a CI build without a database).
    console.error("sitemap: falling back to static pages", error);
    return staticEntries;
  }
}

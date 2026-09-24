export const SITE_NAME = "Connexus";
export const SITE_TAGLINE = "Communities, built for real connections.";
export const SITE_DESCRIPTION =
  "Create and join communities, share posts, discuss in threads, vote, and rank up — with an AI curator keeping every community fresh.";

/** Absolute site URL for metadata, sitemaps and share links. */
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** Plain-text excerpt for meta descriptions: first paragraph, trimmed to ~160 chars. */
export function toExcerpt(text: string | null | undefined, max = 160): string | undefined {
  const firstParagraph = text?.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim();
  if (!firstParagraph) return undefined;
  return firstParagraph.length > max ? `${firstParagraph.slice(0, max - 1).trimEnd()}…` : firstParagraph;
}

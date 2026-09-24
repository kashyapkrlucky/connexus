import { OG_SIZE, renderOgCard } from "@/server/og/card";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/shared/constants/site";

export const alt = "Connexus — Communities, built for real connections.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({ title: SITE_TAGLINE, description: SITE_DESCRIPTION });
}

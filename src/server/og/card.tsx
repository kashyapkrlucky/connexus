import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/shared/constants/site";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: string;
}

let logoDataUrl: Promise<string> | undefined;
function getLogo() {
  logoDataUrl ??= readFile(join(process.cwd(), "public/icon.png")).then(
    (buf) => `data:image/png;base64,${buf.toString("base64")}`
  );
  return logoDataUrl;
}

const clamp = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** Branded 1200×630 share card used for the site, posts and communities. */
export async function renderOgCard({ eyebrow, title, description, footer }: OgCardProps) {
  const logo = await getLogo();
  const long = title.length > 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 85% 0%, #2a2580 0%, #0a0a0a 55%)",
          color: "#f3f4f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
          <img src={logo} width={56} height={56} alt="" />
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME.toLowerCase()}</span>
          {eyebrow && (
            <span
              style={{
                marginLeft: 12,
                padding: "6px 16px",
                borderRadius: 999,
                background: "rgba(102, 95, 242, 0.18)",
                color: "#a5a1f8",
                fontSize: 26,
              }}
            >
              {eyebrow}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: long ? 56 : 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            {clamp(title, 120)}
          </div>
          {description && (
            <div style={{ fontSize: 28, lineHeight: 1.4, color: "#9ca3af" }}>{clamp(description, 150)}</div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#6b7280" }}>
          <span>{footer ?? SITE_TAGLINE}</span>
          <span style={{ color: "#665ff2" }}>●</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}

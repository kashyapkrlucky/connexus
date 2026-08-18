import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atlas-id.vercel.app",
      },
      {
        protocol: "https",
        hostname: "kozsmuhorghziwxqzvuq.supabase.co",
      },
    ],
  },
};

export default nextConfig;

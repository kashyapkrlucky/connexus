import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/shared/constants/imageHosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname })),
  },
};

export default nextConfig;

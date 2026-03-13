import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Convex has its own type checking; skip during Next.js build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
    output: "standalone",
    serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
  };
  return nextConfig;
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal, self-contained server bundle for Docker.
  // See .next/standalone — this is what the Dockerfile ships.
  output: "standalone",
};

export default nextConfig;

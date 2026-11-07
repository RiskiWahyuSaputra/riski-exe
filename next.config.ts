import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: { optimizePackageImports: ["@react-three/drei"] },
};

export default nextConfig;

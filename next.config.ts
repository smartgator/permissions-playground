import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for compatibility with Node.js polyfills
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;

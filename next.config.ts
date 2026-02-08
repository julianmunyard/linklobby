import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "p16-sign-sg.tiktokcdn.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = "(typeof self !== 'undefined' ? self : this)"
    }
    return config
  },
};

export default nextConfig;

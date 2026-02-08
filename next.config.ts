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
  // Superpowered SDK: WASM content-type + COOP/COEP for SharedArrayBuffer
  // Same pattern as Munyard Mixer's next.config.ts
  async headers() {
    return [
      {
        source: "/superpowered/:file*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/:path*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        // Editor pages (audio card creation/editing)
        source: "/editor/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        // Preview pages
        source: "/preview/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = "(typeof self !== 'undefined' ? self : this)"
    }
    return config
  },
};

export default nextConfig;

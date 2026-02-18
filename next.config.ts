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
      // NOTE: COOP/COEP headers removed — they blocked cross-origin iframe embeds
      // (Spotify, SoundCloud, etc.). Superpowered SDK falls back without SharedArrayBuffer.
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

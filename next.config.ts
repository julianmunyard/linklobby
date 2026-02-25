import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}
    https://*.supabase.co
    https://connect.facebook.net
    https://www.googletagmanager.com
    https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://i.ytimg.com
    https://i.vimeocdn.com https://p16-sign-sg.tiktokcdn.com
    https://www.facebook.com https://www.google-analytics.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://www.google-analytics.com
    https://graph.facebook.com wss://*.supabase.co;
  frame-src https://www.youtube.com https://player.vimeo.com
    https://open.spotify.com https://w.soundcloud.com
    https://www.tiktok.com;
  media-src 'self' blob: https://*.supabase.co;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s+/g, ' ').trim()

const nextConfig: NextConfig = {
  devIndicators: false,
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
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
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

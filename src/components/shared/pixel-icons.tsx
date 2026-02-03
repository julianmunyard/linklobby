// src/components/shared/pixel-icons.tsx
import type { SocialPlatform } from "@/types/profile"

/**
 * Pixel icon paths for 8-bit style social icons
 * Used when System Settings theme is active (hasPixelIcons: true)
 */
export const PIXEL_ICON_PATHS: Record<SocialPlatform, string> = {
  // Popular
  instagram: "/icons/pixel/instagram.svg",
  tiktok: "/icons/pixel/tiktok.svg",
  youtube: "/icons/pixel/youtube.svg",
  spotify: "/icons/pixel/spotify.svg",
  twitter: "/icons/pixel/twitter.svg",
  // Music
  soundcloud: "/icons/pixel/soundcloud.svg",
  applemusic: "/icons/pixel/applemusic.svg",
  bandcamp: "/icons/pixel/bandcamp.svg",
  deezer: "/icons/pixel/deezer.svg",
  amazonmusic: "/icons/pixel/amazonmusic.svg",
  // Social
  facebook: "/icons/pixel/facebook.svg",
  threads: "/icons/pixel/threads.svg",
  bluesky: "/icons/pixel/bluesky.svg",
  snapchat: "/icons/pixel/snapchat.svg",
  pinterest: "/icons/pixel/pinterest.svg",
  linkedin: "/icons/pixel/linkedin.svg",
  whatsapp: "/icons/pixel/whatsapp.svg",
  // Streaming
  twitch: "/icons/pixel/twitch.svg",
  kick: "/icons/pixel/kick.svg",
  // Community
  discord: "/icons/pixel/discord.svg",
  // Other
  website: "/icons/pixel/website.svg",
  email: "/icons/pixel/email.svg",
  patreon: "/icons/pixel/patreon.svg",
  venmo: "/icons/pixel/venmo.svg",
  cashapp: "/icons/pixel/cashapp.svg",
  paypal: "/icons/pixel/paypal.svg",
}

interface PixelIconProps {
  platform: SocialPlatform
  className?: string
  style?: React.CSSProperties
}

/**
 * PixelIcon - Renders 8-bit style social media icons
 * Uses CSS mask-image to apply currentColor to SVG
 */
export function PixelIcon({ platform, className, style }: PixelIconProps) {
  const path = PIXEL_ICON_PATHS[platform]

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${path})`,
        maskImage: `url(${path})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

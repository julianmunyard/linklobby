import { Globe, Mail, Music } from "lucide-react"
import type { SocialIcon, SocialPlatform } from "@/types/profile"
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from "react-icons/si"
import type { ComponentType } from "react"

type IconComponent = ComponentType<{ className?: string }>

const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  spotify: SiSpotify,
  twitter: SiX,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  deezer: Music,
  amazonmusic: SiAmazonmusic,
  facebook: SiFacebook,
  threads: SiThreads,
  bluesky: SiBluesky,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  linkedin: SiLinkedin,
  whatsapp: SiWhatsapp,
  twitch: SiTwitch,
  kick: SiKick,
  discord: SiDiscord,
  website: Globe,
  email: Mail,
  patreon: SiPatreon,
  venmo: SiVenmo,
  cashapp: SiCashapp,
  paypal: SiPaypal,
}

interface StaticSocialIconsInlineProps {
  socialIconsJson: string
  socialIconSize?: number
  socialIconColor?: string | null
  headerTextColor?: string | null
}

/**
 * Static social icons rendered inline at card position in the flow grid.
 * Server-rendered, no client stores needed.
 */
export function StaticSocialIconsInline({
  socialIconsJson,
  socialIconSize = 24,
  socialIconColor,
  headerTextColor,
}: StaticSocialIconsInlineProps) {
  const socialIcons: SocialIcon[] = JSON.parse(socialIconsJson)
  const sortedIcons = [...socialIcons].sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  )

  if (sortedIcons.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-3 py-2">
      {sortedIcons.map((icon) => {
        const IconComponent = PLATFORM_ICONS[icon.platform]
        if (!IconComponent) return null

        return (
          <a
            key={icon.id}
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-text transition-opacity hover:opacity-70"
            aria-label={icon.platform}
            style={(socialIconColor || headerTextColor) ? { color: socialIconColor || headerTextColor! } : undefined}
          >
            <div style={{ width: socialIconSize, height: socialIconSize }}>
              <IconComponent className="w-full h-full" />
            </div>
          </a>
        )
      })}
    </div>
  )
}

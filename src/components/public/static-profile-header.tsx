import Image from "next/image"
import { User, Globe, Mail, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { FuzzyText } from "@/components/ui/fuzzy-text"
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

// Platform icon mapping (matches social-icon-picker.tsx)
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

interface StaticProfileHeaderProps {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  avatarFeather: number
  avatarSize: number
  avatarShape?: 'circle' | 'square'
  showAvatar: boolean
  showTitle: boolean
  showBio?: boolean
  titleSize: "small" | "large"
  showLogo: boolean
  logoUrl: string | null
  logoScale: number
  profileLayout: "classic" | "hero"
  headerTextColor: string | null
  socialIconColor: string | null
  // Social icons
  showSocialIcons: boolean
  socialIconsJson?: string | null
  socialIconSize?: number
  // Per-header font overrides
  titleFont?: string | null
  bioFont?: string | null
  // Theme fonts
  fuzzyEnabled?: boolean
  fuzzyIntensity?: number
  fuzzySpeed?: number
}

/**
 * StaticProfileHeader - Server-rendered profile header for public pages
 *
 * Key differences from editor ProfileHeader:
 * - No "use client" - server-rendered
 * - Receives profile data as props (not from store)
 * - Parses social_icons JSON string
 * - No edit interactions
 * - Uses Next/Image with priority for LCP
 */
export function StaticProfileHeader({
  displayName,
  bio,
  avatarUrl,
  avatarFeather,
  avatarSize = 80,
  avatarShape = 'circle',
  showAvatar,
  showTitle,
  showBio = true,
  titleSize,
  showLogo,
  logoUrl,
  logoScale,
  profileLayout,
  headerTextColor,
  socialIconColor,
  showSocialIcons,
  socialIconsJson,
  socialIconSize = 24,
  titleFont,
  bioFont,
  fuzzyEnabled = false,
  fuzzyIntensity = 0.19,
  fuzzySpeed = 12,
}: StaticProfileHeaderProps) {
  // Parse social icons from JSON string
  const socialIcons: SocialIcon[] = socialIconsJson
    ? JSON.parse(socialIconsJson)
    : []

  // Sort social icons by sortKey
  const sortedIcons = [...socialIcons].sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  )

  // Render social icons
  const renderSocialIcons = () => {
    if (!showSocialIcons || sortedIcons.length === 0) return null

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {sortedIcons.map((icon) => {
          const IconComponent = PLATFORM_ICONS[icon.platform]
          if (!IconComponent) return null

          const iconContent = (
            <div style={{ width: socialIconSize, height: socialIconSize }}>
              <IconComponent className="w-full h-full" />
            </div>
          )

          if (!icon.url) {
            return (
              <span
                key={icon.id}
                className="text-theme-text"
                aria-label={icon.platform}
                style={(socialIconColor || headerTextColor) ? { color: socialIconColor || headerTextColor! } : undefined}
              >
                {iconContent}
              </span>
            )
          }

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
              {iconContent}
            </a>
          )
        })}
      </div>
    )
  }

  // Render logo
  const renderLogo = () => {
    if (!showLogo || !logoUrl) return null

    // Scale logo based on logoScale (50-300%)
    const scaledWidth = Math.round(192 * (logoScale / 100))
    const scaledHeight = Math.round(48 * (logoScale / 100))

    return (
      <div
        className="relative max-w-full"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <Image
          src={logoUrl}
          alt=""
          width={scaledWidth}
          height={scaledHeight}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    )
  }

  // Render title text
  const renderTitle = () => {
    if (!showTitle || !displayName) return null

    return (
      <h1
        className={cn(
          "font-bold text-center break-words w-full max-w-xs text-theme-text",
          titleSize === "large" ? "text-4xl leading-tight" : "text-lg"
        )}
        style={{
          fontFamily: titleFont || 'var(--font-theme-heading)',
          ...(headerTextColor && { color: headerTextColor })
        }}
      >
        {fuzzyEnabled ? (
          <FuzzyText intensity={fuzzyIntensity} speed={fuzzySpeed}>{displayName}</FuzzyText>
        ) : (
          displayName
        )}
      </h1>
    )
  }

  // Render bio
  const renderBio = () => {
    if (!showBio || !bio) return null

    return (
      <p
        className="text-sm text-theme-text/70 text-center max-w-xs"
        style={{
          fontFamily: bioFont || 'var(--font-theme-body)',
          ...(headerTextColor && { color: headerTextColor, opacity: 0.7 })
        }}
      >
        {bio}
      </p>
    )
  }

  // Calculate feather mask for classic layout avatar (circular)
  // When feather > 0, the mask handles both shape AND soft edge fade
  // The gradient goes from solid center to transparent edge with a gradual transition
  const featherMask = avatarFeather > 0
    ? `radial-gradient(circle, black ${Math.max(0, 70 - avatarFeather * 0.7)}%, transparent ${Math.min(100, 70 + avatarFeather * 0.3)}%)`
    : undefined

  // Classic layout: centered circle avatar, title below
  if (profileLayout === "classic") {
    return (
      <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-2 transition-opacity duration-200">
        {/* Avatar - small circle (only if showAvatar is true) */}
        {/* When feather > 0, we remove the hard clip and let mask-image handle the soft edge */}
        {showAvatar && (
          <div
            className={cn(
              "relative overflow-hidden",
              avatarShape === 'square' ? "rounded-lg" : "rounded-full",
              !avatarUrl && "bg-muted"
            )}
            style={{ width: avatarSize, height: avatarSize }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={avatarSize}
                height={avatarSize}
                className="w-full h-full object-cover"
                style={featherMask ? {
                  WebkitMaskImage: featherMask,
                  maskImage: featherMask,
                } : undefined}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Logo */}
        {renderLogo()}

        {/* Title */}
        {renderTitle()}

        {/* Bio */}
        {renderBio()}

        {/* Social Icons */}
        {renderSocialIcons()}
      </div>
    )
  }

  // Hero layout: larger banner-style avatar, title + icons below
  return (
    <div className="transition-opacity duration-200">
      {/* Avatar - larger, banner-style (only if showAvatar is true) */}
      {showAvatar && (
        <div className="relative w-full aspect-[3/1] bg-muted overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-20 h-20 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Logo, Title, Bio, Social Icons below banner */}
      <div className="flex flex-col items-center gap-4 px-4 pt-4 pb-2">
        {renderLogo()}
        {renderTitle()}
        {renderBio()}
        {renderSocialIcons()}
      </div>
    </div>
  )
}

import Image from "next/image"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { FuzzyText } from "@/components/ui/fuzzy-text"
import type { SocialIcon } from "@/types/profile"

interface StaticProfileHeaderProps {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  avatarFeather: number
  showAvatar: boolean
  showTitle: boolean
  titleSize: "small" | "large"
  showLogo: boolean
  logoUrl: string | null
  logoScale: number
  profileLayout: "classic" | "hero"
  headerTextColor: string | null
  // Social icons stored as JSON string in database
  socialIconsJson?: string | null
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
  showAvatar,
  showTitle,
  titleSize,
  showLogo,
  logoUrl,
  logoScale,
  profileLayout,
  headerTextColor,
  socialIconsJson,
  fuzzyEnabled = false,
  fuzzyIntensity = 0.19,
  fuzzySpeed = 12,
}: StaticProfileHeaderProps) {
  // Parse social icons from JSON string
  const socialIcons: SocialIcon[] = socialIconsJson
    ? JSON.parse(socialIconsJson)
    : []

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
          fontFamily: 'var(--font-theme-heading)',
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
    if (!bio) return null

    return (
      <p
        className="text-sm text-theme-text/70 text-center max-w-xs"
        style={{
          fontFamily: 'var(--font-theme-body)',
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
      <div className="flex flex-col items-center gap-4 p-6 transition-opacity duration-200">
        {/* Avatar - small circle (only if showAvatar is true) */}
        {/* When feather > 0, we remove the hard clip and let mask-image handle the soft edge */}
        {showAvatar && (
          <div
            className={cn(
              "relative w-20 h-20",
              // Only show bg-muted when no feather (for placeholder/fallback circle)
              avatarFeather === 0 && "bg-muted rounded-full overflow-hidden"
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className={cn(
                  "w-full h-full object-cover",
                  avatarFeather === 0 && "rounded-full"
                )}
                style={featherMask ? {
                  WebkitMaskImage: featherMask,
                  maskImage: featherMask,
                } : undefined}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-full bg-muted">
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

      {/* Logo, Title, Bio below banner */}
      <div className="flex flex-col items-center gap-4 p-4">
        {renderLogo()}
        {renderTitle()}
        {renderBio()}
      </div>
    </div>
  )
}

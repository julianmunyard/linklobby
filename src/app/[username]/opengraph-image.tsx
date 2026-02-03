import { ImageResponse } from 'next/og'
import { fetchPublicPageData } from '@/lib/supabase/public'

// Force edge runtime for fast OG image generation
export const runtime = 'edge'

export const alt = 'Profile preview'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

/**
 * Generate dynamic Open Graph image for profile pages
 *
 * Shows:
 * - Profile avatar (if visible)
 * - Display name
 * - Bio (truncated)
 * - Theme colors
 * - LinkLobby branding
 */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await fetchPublicPageData(username)

  // Fallback for 404 or unpublished pages
  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
          }}
        >
          LinkLobby
        </div>
      ),
      { ...size }
    )
  }

  const { profile, page } = data
  const displayName = profile.display_name || profile.username
  const bio = profile.bio || ''
  const avatarUrl = profile.show_avatar ? profile.avatar_url : null

  // Extract theme colors from theme_settings
  const themeSettings = page.theme_settings
  const backgroundColor = themeSettings?.background?.value || '#000000'
  const textColor = profile.header_text_color || themeSettings?.colors?.text || '#ffffff'

  // Truncate bio to fit
  const maxBioLength = 120
  const truncatedBio = bio.length > maxBioLength
    ? `${bio.substring(0, maxBioLength)}...`
    : bio

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Profile content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
          }}
        >
          {/* Avatar */}
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={displayName}
              width={160}
              height={160}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${textColor}`,
              }}
            />
          )}

          {/* Display name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: textColor,
              lineHeight: 1.2,
            }}
          >
            {displayName}
          </div>

          {/* Bio */}
          {truncatedBio && (
            <div
              style={{
                fontSize: 28,
                color: textColor,
                opacity: 0.9,
                maxWidth: '900px',
                lineHeight: 1.4,
              }}
            >
              {truncatedBio}
            </div>
          )}
        </div>

        {/* LinkLobby branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            fontSize: 24,
            color: textColor,
            opacity: 0.6,
          }}
        >
          LinkLobby
        </div>
      </div>
    ),
    { ...size }
  )
}

import { Metadata } from 'next'
import { fetchPublicPageData } from '@/lib/supabase/public'
import { generatePrivacyPolicy } from '@/lib/legal/privacy-policy-generator'

export const metadata: Metadata = {
  title: 'Privacy Policy - LinkLobby',
  description: 'Privacy policy for LinkLobby link-in-bio pages',
}

interface PrivacyPageProps {
  searchParams: { username?: string }
}

/**
 * Privacy Policy Page
 *
 * - If username provided: generates policy based on that artist's enabled features
 * - If no username: shows generic LinkLobby privacy policy (all features listed)
 */
export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const username = searchParams.username

  // Default config (all features enabled for generic policy)
  let config = {
    hasFacebookPixel: true,
    hasGoogleAnalytics: true,
    collectsEmails: true,
    siteName: 'LinkLobby',
    siteUrl: 'https://linklobby.com',
  }

  // If username provided, detect enabled features
  if (username) {
    const pageData = await fetchPublicPageData(username)

    if (pageData) {
      // Check theme settings for pixel IDs
      const themeSettings = (pageData.page.theme_settings || {}) as Record<string, unknown>
      const hasFacebookPixel = !!themeSettings.facebook_pixel_id
      const hasGoogleAnalytics = !!themeSettings.ga_measurement_id

      // Check if email collection cards exist
      const collectsEmails = pageData.cards.some(
        (card) => card.card_type === 'email-collection'
      )

      config = {
        hasFacebookPixel,
        hasGoogleAnalytics,
        collectsEmails,
        siteName: pageData.profile.display_name || username,
        siteUrl: `https://linklobby.com/${username}`,
      }
    }
  }

  // Generate privacy policy markdown
  const policyMarkdown = generatePrivacyPolicy(config)

  // Convert markdown to JSX (simple approach - render structure manually)
  const sections = policyMarkdown.split('\n')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="prose prose-slate lg:prose-lg">
          {sections.map((line, index) => {
            // Heading 1
            if (line.startsWith('# ')) {
              return (
                <h1 key={index} className="text-4xl font-bold text-gray-900 mb-2">
                  {line.substring(2)}
                </h1>
              )
            }

            // Heading 2
            if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  {line.substring(3)}
                </h2>
              )
            }

            // Heading 3
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                  {line.substring(4)}
                </h3>
              )
            }

            // Bold text (e.g., **Last Updated:**)
            if (line.startsWith('**') && line.includes('**')) {
              const parts = line.split('**')
              return (
                <p key={index} className="text-gray-700 mb-2">
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="font-semibold">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              )
            }

            // List items
            if (line.startsWith('- ')) {
              return (
                <li key={index} className="text-gray-700 ml-6 mb-1">
                  {/* Handle inline links [text](url) */}
                  {line.substring(2).split(/(\[.*?\]\(.*?\))/).map((segment, i) => {
                    const linkMatch = segment.match(/\[(.*?)\]\((.*?)\)/)
                    if (linkMatch) {
                      return (
                        <a
                          key={i}
                          href={linkMatch[2]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {linkMatch[1]}
                        </a>
                      )
                    }
                    return segment
                  })}
                </li>
              )
            }

            // Empty line
            if (line.trim() === '') {
              return <div key={index} className="h-2" />
            }

            // Regular paragraph
            return (
              <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                {/* Handle inline links [text](url) */}
                {line.split(/(\[.*?\]\(.*?\))/).map((segment, i) => {
                  const linkMatch = segment.match(/\[(.*?)\]\((.*?)\)/)
                  if (linkMatch) {
                    return (
                      <a
                        key={i}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {linkMatch[1]}
                      </a>
                    )
                  }
                  return segment
                })}
              </p>
            )
          })}
        </article>
      </div>
    </div>
  )
}

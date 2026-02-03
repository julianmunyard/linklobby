import { MetadataRoute } from 'next'

/**
 * Robots.txt configuration
 *
 * Allows:
 * - Root (/) and all public profile pages
 *
 * Disallows:
 * - API routes (no SEO value)
 * - Editor routes (private, requires auth)
 * - Settings routes (private)
 * - Insights routes (private)
 * - Auth pages (low SEO value, sensitive)
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linklobby.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/editor',
        '/editor/*',
        '/settings',
        '/settings/*',
        '/insights',
        '/insights/*',
        '/login',
        '/signup',
        '/auth/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

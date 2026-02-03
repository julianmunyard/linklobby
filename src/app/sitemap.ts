import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

/**
 * Dynamic sitemap generation
 *
 * Lists all published profile pages for search engine discovery.
 * Uses ISR with 1-hour revalidation to keep sitemap fresh.
 */

// Revalidate sitemap every hour
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://linklobby.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]

  // Fetch all published profiles
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, pages!inner(is_published, updated_at)')
    .eq('pages.is_published', true)

  if (!profiles || profiles.length === 0) {
    return staticRoutes
  }

  // Generate URLs for each published profile
  const profileRoutes: MetadataRoute.Sitemap = profiles.map((profile) => {
    // Extract page data from nested structure
    const pageData = Array.isArray(profile.pages) ? profile.pages[0] : profile.pages
    const lastModified = pageData?.updated_at ? new Date(pageData.updated_at) : new Date()

    return {
      url: `${baseUrl}/${profile.username}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  })

  return [...staticRoutes, ...profileRoutes]
}

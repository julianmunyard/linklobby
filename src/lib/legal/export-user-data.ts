// src/lib/legal/export-user-data.ts
// GDPR-compliant data export: ZIP file containing all user data

import JSZip from "jszip"
import type { SupabaseClient } from "@supabase/supabase-js"

interface ExportMetadata {
  exportedAt: string
  userId: string
  username: string
  version: string
}

/**
 * Export all user data as a ZIP file
 * Includes: profile, page config, cards, analytics summary, collected emails, images
 *
 * @param userId - User ID from auth.uid()
 * @param supabase - Authenticated Supabase client
 * @returns ZIP file as Uint8Array
 */
export async function exportUserData(
  userId: string,
  supabase: SupabaseClient
): Promise<Uint8Array> {
  const zip = new JSZip()

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`)
  }

  // Fetch page data
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (pageError) {
    throw new Error(`Failed to fetch page: ${pageError.message}`)
  }

  // Fetch cards
  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_key", { ascending: true })

  if (cardsError) {
    throw new Error(`Failed to fetch cards: ${cardsError.message}`)
  }

  // Fetch analytics summary (aggregated only, no hashes for privacy)
  const { data: analyticsViews, error: analyticsViewsError } = await supabase
    .from("analytics_page_views")
    .select("viewed_at")
    .eq("page_id", page.id)

  const { data: analyticsClicks, error: analyticsClicksError } = await supabase
    .from("analytics_card_clicks")
    .select("card_id, clicked_at")
    .eq("page_id", page.id)

  const analyticsSummary = {
    totalPageViews: analyticsViews?.length || 0,
    totalCardClicks: analyticsClicks?.length || 0,
    cardClickBreakdown: analyticsClicks?.reduce((acc: Record<string, number>, click) => {
      const cardId = click.card_id
      acc[cardId] = (acc[cardId] || 0) + 1
      return acc
    }, {}) || {},
    note: "Only aggregated counts are exported for privacy. Raw visitor hashes are not included.",
  }

  // Fetch collected emails
  const { data: emails, error: emailsError } = await supabase
    .from("collected_emails")
    .select("*")
    .eq("page_id", page.id)
    .order("collected_at", { ascending: false })

  // Create metadata
  const metadata: ExportMetadata = {
    exportedAt: new Date().toISOString(),
    userId: userId,
    username: profile.username,
    version: "1.0.0",
  }

  // Add JSON files to ZIP
  zip.file("README.txt", generateReadme(metadata))
  zip.file("metadata.json", JSON.stringify(metadata, null, 2))
  zip.file("profile.json", JSON.stringify(profile, null, 2))
  zip.file("page-config.json", JSON.stringify(page, null, 2))
  zip.file("cards.json", JSON.stringify(cards || [], null, 2))
  zip.file("analytics-summary.json", JSON.stringify(analyticsSummary, null, 2))
  zip.file("emails.json", JSON.stringify(emails || [], null, 2))

  // Fetch user images from Supabase storage
  const imagesFolder = zip.folder("images")
  if (imagesFolder) {
    await exportUserImages(userId, page.id, supabase, imagesFolder)
  }

  // Generate ZIP file
  const zipBlob = await zip.generateAsync({ type: "uint8array" })
  return zipBlob
}

/**
 * Export user images from Supabase storage
 * Includes: profile avatar, profile logo, card images
 */
async function exportUserImages(
  userId: string,
  pageId: string,
  supabase: SupabaseClient,
  imagesFolder: JSZip
): Promise<void> {
  try {
    // List files in profile-images bucket (avatar, logo)
    const { data: profileFiles, error: profileError } = await supabase.storage
      .from("profile-images")
      .list(userId)

    if (!profileError && profileFiles) {
      for (const file of profileFiles) {
        const { data, error } = await supabase.storage
          .from("profile-images")
          .download(`${userId}/${file.name}`)

        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer()
          imagesFolder.file(`profile/${file.name}`, arrayBuffer)
        }
      }
    }

    // List files in card-images bucket
    const { data: cardFiles, error: cardError } = await supabase.storage
      .from("card-images")
      .list(pageId)

    if (!cardError && cardFiles) {
      for (const cardFolder of cardFiles) {
        // List files within each card folder
        const { data: cardImageFiles, error: cardImageError } = await supabase.storage
          .from("card-images")
          .list(`${pageId}/${cardFolder.name}`)

        if (!cardImageError && cardImageFiles) {
          for (const file of cardImageFiles) {
            const { data, error } = await supabase.storage
              .from("card-images")
              .download(`${pageId}/${cardFolder.name}/${file.name}`)

            if (!error && data) {
              const arrayBuffer = await data.arrayBuffer()
              imagesFolder.file(`cards/${cardFolder.name}/${file.name}`, arrayBuffer)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error exporting images:", error)
    // Non-fatal: continue export even if images fail
    imagesFolder.file(
      "_images_error.txt",
      "Some images could not be exported. This is non-fatal."
    )
  }
}

/**
 * Generate README.txt explaining the export contents
 */
function generateReadme(metadata: ExportMetadata): string {
  return `LinkLobby Data Export
====================

Export Date: ${new Date(metadata.exportedAt).toLocaleString()}
Username: ${metadata.username}
Export Version: ${metadata.version}

This ZIP file contains all your data from LinkLobby in machine-readable JSON format.

Contents:
---------

1. metadata.json
   - Export timestamp, user ID, username, export version

2. profile.json
   - Your profile settings: display name, bio, avatar, logo, social icons

3. page-config.json
   - Page configuration: theme settings, publish status, creation date

4. cards.json
   - All your cards: content, images, links, settings, ordering

5. analytics-summary.json
   - Aggregated analytics data: page views, card clicks
   - Note: Raw visitor hashes are NOT included for privacy

6. emails.json
   - Email addresses collected via your email collection cards
   - Includes: email, name (if provided), collection date, Mailchimp sync status

7. images/
   - profile/
     - Your profile avatar and logo images
   - cards/
     - Images uploaded to your cards

GDPR Compliance:
----------------
This export includes all personal data we store about you as required by GDPR Article 15.
Raw analytics visitor hashes are excluded to protect third-party privacy.

Questions?
----------
Contact: support@linklobby.com
Privacy Policy: https://linklobby.com/privacy
`
}

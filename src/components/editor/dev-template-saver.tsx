"use client"

import { Camera } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/stores/theme-store"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"

/**
 * DEV-ONLY component — renders nothing unless NEXT_PUBLIC_DEV_TOOLS=true.
 *
 * Snapshots the current editor state (cards, theme, profile) and copies
 * formatted template JSON to the clipboard. The dev pastes this into a
 * template definition file in src/lib/templates/data/.
 */
export function DevTemplateSaver() {
  // Gate: render nothing in production or when dev tools are not enabled
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "true") {
    return null
  }

  const handleSaveTemplate = async () => {
    // AUTHORITATIVE theme source: always read from useThemeStore, NOT pageStore.
    // pageStore.theme is a legacy stub (id/name only) and may be stale.
    const themeSnapshot = useThemeStore.getState().getSnapshot()

    // Page store snapshot provides sorted cards array
    const pageSnapshot = usePageStore.getState().getSnapshot()

    // Profile store snapshot provides all profile settings
    const profileSnapshot = useProfileStore.getState().getSnapshot()

    const template = {
      id: `TEMPLATE-${Date.now()}`,
      themeId: themeSnapshot.themeId,
      name: "FILL IN NAME",
      description: "FILL IN DESCRIPTION",
      energyLabel: "FILL IN",
      thumbnailPath: "/templates/FILL-IN/thumbnail.jpg",

      // Strip DB-specific fields from cards so the template is portable.
      // id, page_id, created_at, updated_at are runtime values — not template data.
      cards: pageSnapshot.cards.map((card) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, page_id, created_at, updated_at, ...templateCard } = card
        return templateCard
      }),

      // IMPORTANT: theme comes from useThemeStore (live editor state),
      // NOT from pageSnapshot.theme (which is a stale legacy stub).
      theme: themeSnapshot,

      profile: {
        profileLayout: profileSnapshot.profileLayout,
        showAvatar: profileSnapshot.showAvatar,
        showTitle: profileSnapshot.showTitle,
        titleSize: profileSnapshot.titleSize,
        showSocialIcons: profileSnapshot.showSocialIcons,
        showLogo: profileSnapshot.showLogo,
        headerTextColor: profileSnapshot.headerTextColor,
        socialIconColor: profileSnapshot.socialIconColor,
      },

      // Dev manually populates after downloading/optimizing template assets
      mediaAssets: [],
    }

    const json = JSON.stringify(template, null, 2)
    console.log("[DevTemplateSaver] Template snapshot:", template)

    try {
      await navigator.clipboard.writeText(json)
      toast.success("Template snapshot copied to clipboard")
    } catch {
      toast.error("Failed to copy to clipboard — check console for JSON")
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSaveTemplate}
      className="border-dashed text-muted-foreground hover:text-foreground gap-1.5"
      title="DEV: Copy current page state as template JSON"
    >
      <Camera className="h-3.5 w-3.5" />
      <span className="text-xs">Save Template</span>
      <span className="text-xs font-mono bg-muted px-1 rounded text-muted-foreground">DEV</span>
    </Button>
  )
}

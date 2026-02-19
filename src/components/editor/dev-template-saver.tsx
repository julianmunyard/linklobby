"use client"

import { useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useThemeStore } from "@/stores/theme-store"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"

/**
 * DEV-ONLY component — renders nothing unless NEXT_PUBLIC_DEV_TOOLS=true.
 *
 * Opens a dialog to name the template, then saves the current editor state
 * as a template file on disk. The template appears in the Templates tab
 * after HMR reload.
 */
export function DevTemplateSaver() {
  // Gate: render nothing in production or when dev tools are not enabled
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "true") {
    return null
  }

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [energyLabel, setEnergyLabel] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required")
      return
    }

    setSaving(true)

    try {
      // AUTHORITATIVE theme source: always read from useThemeStore, NOT pageStore.
      const themeSnapshot = useThemeStore.getState().getSnapshot()
      const pageSnapshot = usePageStore.getState().getSnapshot()
      const profileSnapshot = useProfileStore.getState().getSnapshot()

      // Filter out card types that don't belong in templates:
      // - social-icons: icon data lives in profile store, card is auto-created
      // - email-collection: user-specific, not template content
      const EXCLUDED_CARD_TYPES = ['social-icons', 'email-collection']

      // Strip DB-specific fields from cards
      const cards = pageSnapshot.cards
        .filter((card) => !EXCLUDED_CARD_TYPES.includes(card.card_type))
        .map((card) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, page_id, created_at, updated_at, ...templateCard } = card
          return templateCard
        })

      // Collect media asset filenames from card content
      const mediaAssets: string[] = []
      for (const card of cards) {
        const content = card.content as Record<string, unknown>
        if (typeof content?.imageUrl === 'string' && content.imageUrl.startsWith('/templates/')) {
          const filename = content.imageUrl.split('/').pop()
          if (filename) mediaAssets.push(filename)
        }
      }

      // Remap phoneHomeDock card IDs → sortKey references so they survive
      // template apply (where cards get new UUIDs). The apply route will
      // convert these sortKey refs back to real card IDs.
      const themeCopy = { ...themeSnapshot }
      if (Array.isArray(themeCopy.phoneHomeDock) && themeCopy.phoneHomeDock.length > 0) {
        const idToSortKey = new Map(
          pageSnapshot.cards.map((c: { id: string; sortKey: string }) => [c.id, c.sortKey])
        )
        themeCopy.phoneHomeDock = themeCopy.phoneHomeDock
          .map((id: string) => idToSortKey.get(id))
          .filter((sk: string | undefined): sk is string => !!sk)
      }

      const template = {
        themeId: themeSnapshot.themeId,
        cards,
        // IMPORTANT: theme from useThemeStore (live editor state), NOT pageStore
        theme: themeCopy,
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
        mediaAssets,
      }

      const res = await fetch("/api/dev/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || `${name.trim()} template`,
          energyLabel: energyLabel.trim() || undefined,
          template,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      toast.success(data.message || `Template "${name}" saved!`)
      setOpen(false)
      setName("")
      setDescription("")
      setEnergyLabel("")
    } catch (err) {
      console.error("[DevTemplateSaver] save error:", err)
      toast.error(`Failed to save template: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed text-muted-foreground hover:text-foreground gap-1.5"
          title="DEV: Save current page as a template"
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="text-xs">Save Template</span>
          <span className="text-xs font-mono bg-muted px-1 rounded text-muted-foreground">DEV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save the current page design as a reusable template. It will appear in the Templates tab.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="template-name">Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g. Dark Minimal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-desc">Description</Label>
            <Input
              id="template-desc"
              placeholder="e.g. Clean dark aesthetic with bold typography"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-energy">Energy / Genre Label</Label>
            <Input
              id="template-energy"
              placeholder="e.g. hip-hop, indie folk, minimal"
              value={energyLabel}
              onChange={(e) => setEnergyLabel(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

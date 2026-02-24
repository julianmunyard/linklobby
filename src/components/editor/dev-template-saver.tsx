"use client"

import { useState, useEffect, useMemo } from "react"
import { Camera, Loader2, Pencil, Trash2, ListTree, RefreshCw } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useThemeStore } from "@/stores/theme-store"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { getAllTemplates, getTemplate } from "@/lib/templates"
import type { TemplateDefinition } from "@/lib/templates"
import { create } from "zustand"

// ---------------------------------------------------------------------------
// Active template tracking — remembers which template was last applied
// ---------------------------------------------------------------------------

interface ActiveTemplateState {
  activeTemplateId: string | null
  setActiveTemplate: (id: string | null) => void
}

export const useActiveTemplate = create<ActiveTemplateState>((set) => ({
  activeTemplateId: null,
  setActiveTemplate: (id) => set({ activeTemplateId: id }),
}))

// ---------------------------------------------------------------------------
// Snapshot helper — builds template payload from current editor state
// ---------------------------------------------------------------------------

function buildTemplatePayload() {
  const themeSnapshot = useThemeStore.getState().getSnapshot()
  const pageSnapshot = usePageStore.getState().getSnapshot()
  const profileSnapshot = useProfileStore.getState().getSnapshot()

  const EXCLUDED_CARD_TYPES = ['email-collection']

  const cards = pageSnapshot.cards
    .filter((card) => !EXCLUDED_CARD_TYPES.includes(card.card_type))
    .map((card) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, page_id, created_at, updated_at, ...templateCard } = card
      return templateCard
    })

  const mediaAssets: string[] = []
  for (const card of cards) {
    const content = card.content as Record<string, unknown>
    if (typeof content?.imageUrl === 'string' && content.imageUrl.startsWith('/templates/')) {
      const filename = content.imageUrl.split('/').pop()
      if (filename) mediaAssets.push(filename)
    }
  }

  const themeCopy = { ...themeSnapshot }
  if (Array.isArray(themeCopy.phoneHomeDock) && themeCopy.phoneHomeDock.length > 0) {
    const idToSortKey = new Map(
      pageSnapshot.cards.map((c: { id: string; sortKey: string }) => [c.id, c.sortKey])
    )
    themeCopy.phoneHomeDock = themeCopy.phoneHomeDock
      .map((id: string) => idToSortKey.get(id))
      .filter((sk: string | undefined): sk is string => !!sk)
  }

  return {
    themeId: themeSnapshot.themeId,
    cards,
    theme: themeCopy,
    profile: {
      displayName: profileSnapshot.displayName,
      bio: profileSnapshot.bio,
      avatarUrl: profileSnapshot.avatarUrl,
      avatarFeather: profileSnapshot.avatarFeather,
      showAvatar: profileSnapshot.showAvatar,
      showTitle: profileSnapshot.showTitle,
      titleSize: profileSnapshot.titleSize,
      showSocialIcons: profileSnapshot.showSocialIcons,
      showLogo: profileSnapshot.showLogo,
      logoUrl: profileSnapshot.logoUrl,
      logoScale: profileSnapshot.logoScale,
      profileLayout: profileSnapshot.profileLayout,
      headerTextColor: profileSnapshot.headerTextColor,
      socialIconColor: profileSnapshot.socialIconColor,
      socialIcons: profileSnapshot.socialIcons,
    },
    mediaAssets,
  }
}

// ---------------------------------------------------------------------------
// DevTemplateSaver — Save New button
// ---------------------------------------------------------------------------

export function DevTemplateSaver() {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "true") return null

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
      const template = buildTemplatePayload()
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
      toast.error(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed text-muted-foreground hover:text-foreground gap-1.5"
          title="DEV: Save current page as a new template"
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="text-xs">Save New</span>
          <span className="text-xs font-mono bg-muted px-1 rounded text-muted-foreground">DEV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save the current page design as a reusable template.
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
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// DevTemplateManager — Edit/Delete existing templates
// ---------------------------------------------------------------------------

export function DevTemplateManager() {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "true") return null

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<TemplateDefinition | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Edit dialog state
  const [editTemplate, setEditTemplate] = useState<TemplateDefinition | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editEnergyLabel, setEditEnergyLabel] = useState("")

  const themeId = useThemeStore((state) => state.themeId)
  const templates = useMemo(() => getAllTemplates().filter(t => t.themeId === themeId), [themeId])

  // Resave: overwrite template data with current editor state, keeping same name/desc/energy
  const handleResave = async (tmpl: TemplateDefinition) => {
    setSaving(tmpl.id)
    try {
      const template = buildTemplatePayload()
      const res = await fetch("/api/dev/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tmpl.name,
          description: tmpl.description,
          energyLabel: tmpl.energyLabel || undefined,
          template,
          overwriteId: tmpl.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      toast.success(`"${tmpl.name}" resaved with current editor state!`)
    } catch (err) {
      console.error("[DevTemplateManager] resave error:", err)
      toast.error(`Failed to resave: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(null)
    }
  }

  // Edit: update name/description/energy and overwrite with current editor state
  const handleEditSave = async () => {
    if (!editTemplate || !editName.trim()) return
    setSaving(editTemplate.id)
    try {
      const template = buildTemplatePayload()
      const res = await fetch("/api/dev/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || `${editName.trim()} template`,
          energyLabel: editEnergyLabel.trim() || undefined,
          template,
          overwriteId: editTemplate.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      toast.success(`"${editName}" updated!`)
      setEditTemplate(null)
    } catch (err) {
      console.error("[DevTemplateManager] edit error:", err)
      toast.error(`Failed to update: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(null)
    }
  }

  // Delete template
  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      const res = await fetch("/api/dev/delete-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: deleteConfirm.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      toast.success(`"${deleteConfirm.name}" deleted!`)
      setDeleteConfirm(null)
    } catch (err) {
      console.error("[DevTemplateManager] delete error:", err)
      toast.error(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setDeleting(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground hover:text-foreground gap-1.5"
            title="DEV: Edit or delete existing templates"
          >
            <ListTree className="h-3.5 w-3.5" />
            <span className="text-xs">Manage</span>
            <span className="text-xs font-mono bg-muted px-1 rounded text-muted-foreground">DEV</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Templates</DialogTitle>
            <DialogDescription>
              Showing {templates.length} template{templates.length !== 1 ? 's' : ''} for the current theme ({themeId}).
              Resave overwrites with your current editor state.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-2 py-2">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No templates for this theme yet.
              </p>
            )}
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tmpl.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tmpl.id}</p>
                  {tmpl.energyLabel && (
                    <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                      {tmpl.energyLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Resave: quick overwrite with current state */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => handleResave(tmpl)}
                    disabled={saving === tmpl.id}
                  >
                    {saving === tmpl.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Resave"
                    )}
                  </Button>
                  {/* Edit: change name/desc then resave */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditTemplate(tmpl)
                      setEditName(tmpl.name)
                      setEditDescription(tmpl.description)
                      setEditEnergyLabel(tmpl.energyLabel || "")
                    }}
                    title="Edit name/description"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(tmpl)}
                    title="Delete template"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTemplate} onOpenChange={(o) => { if (!o) setEditTemplate(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update metadata and resave with current editor state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Energy / Genre Label</Label>
              <Input value={editEnergyLabel} onChange={(e) => setEditEnergyLabel(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)} disabled={!!saving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={!!saving || !editName.trim()}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteConfirm?.name}&rdquo; ({deleteConfirm?.id}) and its assets. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// DevQuickResave — one-click resave for the last applied template
// ---------------------------------------------------------------------------

export function DevQuickResave() {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "true") return null

  const activeTemplateId = useActiveTemplate((s) => s.activeTemplateId)
  const [saving, setSaving] = useState(false)

  const tmpl = activeTemplateId ? getTemplate(activeTemplateId) : null

  if (!tmpl) return null

  const handleResave = async () => {
    setSaving(true)
    try {
      const template = buildTemplatePayload()
      const res = await fetch("/api/dev/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tmpl.name,
          description: tmpl.description,
          energyLabel: tmpl.energyLabel || undefined,
          template,
          overwriteId: tmpl.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      toast.success(`"${tmpl.name}" resaved!`)
    } catch (err) {
      console.error("[DevQuickResave] error:", err)
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-dashed border-green-500/50 text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1.5"
      onClick={handleResave}
      disabled={saving}
      title={`DEV: Resave "${tmpl.name}" with current editor state`}
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      <span className="text-xs truncate max-w-[120px]">Resave &ldquo;{tmpl.name}&rdquo;</span>
    </Button>
  )
}

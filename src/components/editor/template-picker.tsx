'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { useProfileStore } from '@/stores/profile-store'
import { getTemplatesByTheme } from '@/lib/templates'
import type { TemplateDefinition } from '@/lib/templates'
import type { Card } from '@/types/card'
import type { ThemeState } from '@/types/theme'
import type { Profile } from '@/types/profile'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// TemplatePicker
// ---------------------------------------------------------------------------

export function TemplatePicker() {
  const themeId = useThemeStore((state) => state.themeId)
  const templates = getTemplatesByTheme(themeId)

  const [selected, setSelected] = useState<TemplateDefinition | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingMode, setPendingMode] = useState<'replace' | 'add' | null>(null)
  const [loading, setLoading] = useState(false)

  // ---------------------------------------------------------------------------
  // Apply flow
  // ---------------------------------------------------------------------------

  async function applyTemplate(template: TemplateDefinition, mode: 'replace' | 'add') {
    setLoading(true)
    setShowConfirm(false)

    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, mode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const data = await res.json() as {
        cards: Card[]
        theme: ThemeState
        profile: Partial<Profile>
        templateName: string
      }

      // Hydrate stores
      usePageStore.getState().setCards(data.cards)
      useThemeStore.getState().loadFromDatabase(data.theme)
      useProfileStore.getState().initializeProfile(data.profile)

      // CRITICAL: loadFromDatabase and initializeProfile both set hasChanges: false,
      // but applying a template IS a new change that must be persisted via autosave.
      useThemeStore.setState({ hasChanges: true })
      useProfileStore.setState({ hasChanges: true })

      toast.success(`Template "${data.templateName}" applied!`)
      setSelected(null)
    } catch (err) {
      console.error('[TemplatePicker] apply error:', err)
      toast.error('Failed to apply template. Please try again.')
    } finally {
      setLoading(false)
      setPendingMode(null)
    }
  }

  // ---------------------------------------------------------------------------
  // "Use Template" button click handler
  // ---------------------------------------------------------------------------

  function handleUseTemplate(template: TemplateDefinition) {
    const existingCardCount = usePageStore.getState().cards.length

    if (existingCardCount > 0) {
      setPendingMode(null)
      setShowConfirm(true)
    } else {
      // No existing cards — apply immediately in replace mode
      applyTemplate(template, 'replace')
    }
  }

  // ---------------------------------------------------------------------------
  // Confirmation dialog actions
  // ---------------------------------------------------------------------------

  function handleConfirmReplace() {
    if (!selected) return
    applyTemplate(selected, 'replace')
  }

  function handleConfirmAdd() {
    if (!selected) return
    applyTemplate(selected, 'add')
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <LayoutTemplate className="w-8 h-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No templates available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            No templates available for this theme yet
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Selected template detail view
  // ---------------------------------------------------------------------------

  if (selected) {
    const cardCount = selected.cards.length
    const cardLabel = cardCount === 1 ? '1 card' : `${cardCount} cards`

    return (
      <>
        <div className="flex flex-col gap-4">
          {/* Back button */}
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Templates</span>
          </button>

          {/* Thumbnail */}
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-muted">
            <Image
              src={selected.thumbnailPath}
              alt={selected.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <h4 className="font-semibold text-sm flex-1">{selected.name}</h4>
              {selected.energyLabel && (
                <span className="shrink-0 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                  {selected.energyLabel}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selected.description}
            </p>

            <p className="text-xs text-muted-foreground/70">
              {cardLabel}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full h-11"
              onClick={() => handleUseTemplate(selected)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying…
                </>
              ) : (
                'Use Template'
              )}
            </Button>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Confirmation dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply Template?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {usePageStore.getState().cards.length} existing card
                {usePageStore.getState().cards.length === 1 ? '' : 's'}. What would you like to do?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="outline"
                onClick={handleConfirmAdd}
              >
                Add to my page
              </AlertDialogAction>
              <AlertDialogAction onClick={handleConfirmReplace}>
                Replace my page
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // ---------------------------------------------------------------------------
  // Template grid
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
      {templates.map((template) => (
        <motion.button
          key={template.id}
          onClick={() => setSelected(template)}
          className={cn(
            'flex flex-col rounded-lg border-2 border-border bg-card text-left overflow-hidden',
            'transition-colors hover:border-accent',
            'min-h-[44px]'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.12 }}
        >
          {/* Thumbnail */}
          <div className="relative w-full aspect-[9/16] bg-muted">
            <Image
              src={template.thumbnailPath}
              alt={template.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 150px"
            />
          </div>

          {/* Card info */}
          <div className="p-2.5 flex flex-col gap-1">
            <div className="flex items-start gap-1.5 justify-between">
              <span className="text-xs font-medium leading-tight flex-1 min-w-0 truncate">
                {template.name}
              </span>
              {template.energyLabel && (
                <span className="shrink-0 text-[9px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                  {template.energyLabel}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
              {template.description}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

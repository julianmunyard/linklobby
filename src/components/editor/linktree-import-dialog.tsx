// src/components/editor/linktree-import-dialog.tsx
'use client'

import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePageStore } from '@/stores/page-store'
import type { Card } from '@/types/card'

interface LinktreeImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ImportMode = 'add' | 'replace'

export function LinktreeImportDialog({ open, onOpenChange }: LinktreeImportDialogProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingMode, setPendingMode] = useState<ImportMode | null>(null)

  const cards = usePageStore((state) => state.cards)
  const setCards = usePageStore((state) => state.setCards)
  const hasExistingCards = cards.length > 0

  const handleImport = async (mode: ImportMode) => {
    if (!username.trim()) {
      toast.error('Please enter a Linktree username or URL')
      return
    }

    setIsLoading(true)
    setShowConfirmDialog(false)

    try {
      const existingCards = mode === 'add' ? cards : []

      const response = await fetch('/api/import/linktree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          existingCards,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to import')
        return
      }

      // Update store with imported cards
      if (mode === 'replace') {
        setCards(data.cards)
      } else {
        setCards([...cards, ...data.cards])
      }

      // Show success toast
      if (data.failed > 0) {
        toast.success(`Imported ${data.imported} links (${data.failed} failed)`)
      } else {
        toast.success(`Imported ${data.imported} links`)
      }

      // Reset and close
      setUsername('')
      onOpenChange(false)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Please enter a Linktree username or URL')
      return
    }

    // If user has existing cards, ask what to do
    if (hasExistingCards) {
      setShowConfirmDialog(true)
    } else {
      handleImport('add')
    }
  }

  const handleModeSelect = (mode: ImportMode) => {
    setPendingMode(mode)
    handleImport(mode)
  }

  return (
    <>
      <Dialog open={open && !showConfirmDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import from Linktree</DialogTitle>
            <DialogDescription>
              Enter your Linktree username or URL to import your existing links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Linktree Username or URL</Label>
                <Input
                  id="username"
                  placeholder="artistname or linktr.ee/artistname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !username.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for existing cards */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have existing cards</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add the imported links to your existing cards, or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleModeSelect('add')}
              disabled={isLoading}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {isLoading && pendingMode === 'add' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add to existing
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleModeSelect('replace')}
              disabled={isLoading}
            >
              {isLoading && pendingMode === 'replace' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

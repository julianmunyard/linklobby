"use client"

import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'
import { useHistory } from '@/hooks/use-history'

export function HistoryHotkeys() {
  const { undo, redo, canUndo, canRedo } = useHistory()

  // Undo: Ctrl+Z / Cmd+Z
  useHotkeys(
    'ctrl+z, meta+z',
    (e) => {
      e.preventDefault()
      if (canUndo) {
        undo()
        toast('Undone', { duration: 2000 })
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: false, // Let native undo work in text fields
    },
    [canUndo, undo]
  )

  // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
  useHotkeys(
    'ctrl+shift+z, meta+shift+z',
    (e) => {
      e.preventDefault()
      if (canRedo) {
        redo()
        toast('Redone', { duration: 2000 })
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: false, // Let native redo work in text fields
    },
    [canRedo, redo]
  )

  // Invisible component - just registers hotkeys
  return null
}

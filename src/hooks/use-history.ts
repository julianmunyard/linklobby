import { useStore } from 'zustand'
import { usePageStore } from '@/stores/page-store'

export function useHistory() {
  // Get actions (non-reactive) - stable references
  const { undo, redo, clear, pause, resume } = usePageStore.temporal.getState()

  // Subscribe to state (reactive) for button disabled states
  const canUndo = useStore(usePageStore.temporal, (s) => s.pastStates.length > 0)
  const canRedo = useStore(usePageStore.temporal, (s) => s.futureStates.length > 0)

  return { undo, redo, clear, pause, resume, canUndo, canRedo }
}

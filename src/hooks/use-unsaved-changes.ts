"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { usePageStore } from "@/stores/page-store"

interface UseUnsavedChangesReturn {
  showDialog: boolean
  setShowDialog: (show: boolean) => void
  pendingNavigation: string | null
  confirmNavigation: () => void
  cancelNavigation: () => void
}

export function useUnsavedChanges(): UseUnsavedChangesReturn {
  const router = useRouter()
  const hasChanges = usePageStore((state) => state.hasChanges)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Handle browser close/refresh (native browser dialog)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but returnValue is required
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!hasChanges) return

    // Push a state to detect back button
    window.history.pushState(null, "", window.location.href)

    const handlePopState = () => {
      if (hasChanges) {
        // Restore the URL (prevents navigation)
        window.history.pushState(null, "", window.location.href)
        setPendingNavigation("back")
        setShowDialog(true)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [hasChanges])

  // Intercept internal link clicks
  const handleLinkClick = useCallback(
    (e: MouseEvent) => {
      if (!hasChanges) return

      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (!link) return

      // Only intercept internal links
      const href = link.getAttribute("href")
      if (!href) return

      // Check if it's an internal link (same origin or relative)
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin) ||
        (!href.startsWith("http") && !href.startsWith("mailto:"))

      // Don't intercept links that open in new tabs
      const opensNewTab =
        link.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey

      if (isInternal && !opensNewTab) {
        e.preventDefault()
        e.stopPropagation()
        setPendingNavigation(href)
        setShowDialog(true)
      }
    },
    [hasChanges]
  )

  useEffect(() => {
    // Use capture phase to intercept before other handlers
    document.addEventListener("click", handleLinkClick, true)
    return () => document.removeEventListener("click", handleLinkClick, true)
  }, [handleLinkClick])

  const confirmNavigation = useCallback(() => {
    // User confirmed they want to leave - discard changes and navigate
    usePageStore.getState().discardChanges()
    setShowDialog(false)

    if (pendingNavigation === "back") {
      // Go back in history
      window.history.back()
    } else if (pendingNavigation) {
      // Navigate to the pending URL
      router.push(pendingNavigation)
    }
    setPendingNavigation(null)
  }, [pendingNavigation, router])

  const cancelNavigation = useCallback(() => {
    // User cancelled - stay on page
    setShowDialog(false)
    setPendingNavigation(null)
  }, [])

  return {
    showDialog,
    setShowDialog,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation,
  }
}

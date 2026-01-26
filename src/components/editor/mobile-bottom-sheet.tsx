"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
}

// Snap points: peek (small visible portion) and full open
const SNAP_PEEK = 0.08 // ~8% of viewport height - just the handle
const SNAP_FULL = 0.85 // 85% of viewport height

/**
 * Mobile bottom sheet wrapper using Vaul Drawer.
 * Always visible with a peek at the bottom that invites pulling up.
 * Swipe up to open fully, swipe down to collapse to peek.
 */
export function MobileBottomSheet({
  open,
  onOpenChange,
  children,
  title = "Editor",
}: MobileBottomSheetProps) {
  // Derive snap from open prop - no internal state needed
  const activeSnap = open ? SNAP_FULL : SNAP_PEEK

  // When snap changes, update external open state
  const handleSnapChange = (snap: number | string | null) => {
    // Consider "open" when at full snap
    onOpenChange(snap === SNAP_FULL)
  }

  return (
    <Drawer
      open={true} // Always mounted
      snapPoints={[SNAP_PEEK, SNAP_FULL]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={handleSnapChange}
      modal={false}
      dismissible={false} // Don't allow full dismiss, only collapse to peek
    >
      <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col">
        {/* Peek area - always visible, tap to expand */}
        <div
          className="cursor-pointer"
          onClick={() => !open && onOpenChange(true)}
        >
          <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
            <DrawerTitle>{title}</DrawerTitle>
            {open && (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="touch-none"
                  aria-label="Close editor"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenChange(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            )}
          </DrawerHeader>
        </div>

        {/* Scrollable content area - only interactive when open */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          "touch-pan-y",
          !open && "pointer-events-none" // Disable interaction when peeking
        )}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

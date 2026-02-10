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

/**
 * Mobile bottom sheet wrapper using Vaul Drawer.
 * Slides from bottom with swipe-down to dismiss.
 */
export function MobileBottomSheet({
  open,
  onOpenChange,
  children,
  title = "Editor",
}: MobileBottomSheetProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
    >
      <DrawerContent className="h-[85dvh] max-h-[85dvh] flex flex-col">
        <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="touch-none"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Scrollable content area */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          "touch-pan-y"
        )}>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

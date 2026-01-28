"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { DesignPanel } from "./design-panel"

export function DesignTab() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <DesignPanel />
      </div>
    </ScrollArea>
  )
}

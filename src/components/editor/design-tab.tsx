"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { HeaderSection } from "./header-section"

export function DesignTab() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <HeaderSection />

        {/* Future sections: Theme, Background, etc. */}
      </div>
    </ScrollArea>
  )
}

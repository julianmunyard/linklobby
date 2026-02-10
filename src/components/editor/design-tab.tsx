"use client"

import { DesignPanel } from "./design-panel"

export function DesignTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        <DesignPanel />
      </div>
    </div>
  )
}

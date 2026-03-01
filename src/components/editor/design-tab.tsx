"use client"

import { DesignPanel } from "./design-panel"

interface DesignTabProps {
  initialSubTab?: string | null
  initialThemeId?: string | null
}

export function DesignTab({ initialSubTab, initialThemeId }: DesignTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        <DesignPanel initialSubTab={initialSubTab} initialThemeId={initialThemeId} />
      </div>
    </div>
  )
}

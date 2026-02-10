"use client"

import { DesignPanel } from "./design-panel"

interface DesignTabProps {
  initialSubTab?: string | null
}

export function DesignTab({ initialSubTab }: DesignTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-20">
        <DesignPanel initialSubTab={initialSubTab} />
      </div>
    </div>
  )
}

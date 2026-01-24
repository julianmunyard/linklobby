"use client"

import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels"

import { EditorPanel } from "./editor-panel"
import { PreviewPanel } from "./preview-panel"
import { cn } from "@/lib/utils"

export function EditorLayout() {
  return (
    <Group
      orientation="horizontal"
      id="editor-layout"
      className="h-full"
    >
      {/* Editor panel: 25-60% width, default 40% */}
      <Panel
        defaultSize={40}
        minSize={25}
        maxSize={60}
        className="bg-background"
      >
        <EditorPanel />
      </Panel>

      {/* Resize handle with extended hit area */}
      <Separator
        className={cn(
          "relative w-1 bg-border transition-colors",
          "hover:bg-primary/50 active:bg-primary",
          "data-[resize-handle-state=hover]:bg-primary/50",
          "data-[resize-handle-state=drag]:bg-primary",
          // Extended hit area for accessibility
          "before:absolute before:inset-y-0 before:-left-1 before:-right-1",
          "before:content-['']"
        )}
      />

      {/* Preview panel: 40%+ width, default 60% */}
      <Panel
        defaultSize={60}
        minSize={40}
        className="bg-muted/30"
      >
        <PreviewPanel />
      </Panel>
    </Group>
  )
}

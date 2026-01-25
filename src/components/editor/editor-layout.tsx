"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Panel,
  Group,
  Separator,
  type Layout,
} from "react-resizable-panels"

import { EditorPanel } from "./editor-panel"
import { PreviewPanel } from "./preview-panel"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "editor-layout"

export function EditorLayout() {
  const [mounted, setMounted] = useState(false)
  const [defaultLayout, setDefaultLayout] = useState<Layout | undefined>(undefined)

  // Only access localStorage after mount (client-side)
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setDefaultLayout(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const onLayoutChanged = useCallback((layout: Layout) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <Group
      orientation="horizontal"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
      className="h-full"
    >
      {/* Editor panel: 25-60% width, default 40% */}
      <Panel
        id="editor"
        defaultSize="40%"
        minSize="25%"
        maxSize="60%"
        className="bg-background"
      >
        <EditorPanel />
      </Panel>

      {/* Resize handle with extended hit area */}
      <Separator
        className={cn(
          "relative w-1 bg-border transition-colors",
          "hover:bg-primary/50 active:bg-primary",
          // Extended hit area for accessibility
          "before:absolute before:inset-y-0 before:-left-1 before:-right-1",
          "before:content-['']"
        )}
      />

      {/* Preview panel: 40%+ width, default 60% */}
      <Panel
        id="preview"
        defaultSize="60%"
        minSize="40%"
        className="bg-muted/30"
      >
        <PreviewPanel />
      </Panel>
    </Group>
  )
}

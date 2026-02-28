"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface InlineEditableProps {
  value: string
  onCommit: (value: string) => void
  multiline?: boolean
  className?: string
  placeholder?: string
  onEditStart?: () => void
  onEditEnd?: () => void
  /** Immediately enter edit mode on mount */
  autoEdit?: boolean
}

const DOUBLE_TAP_MS = 400

/**
 * Uncontrolled contentEditable wrapper with ref-based approach.
 * Double-tap/click to enter edit mode. Uses onTouchEnd timing for
 * mobile (no 300ms click delay) and onDoubleClick for desktop.
 * Syncs prop value to DOM only when not editing.
 * Commits on blur. Cancels on Escape. Submits single-line on Enter.
 */
export function InlineEditable({
  value,
  onCommit,
  multiline = false,
  className,
  placeholder,
  onEditStart,
  onEditEnd,
  autoEdit = false,
}: InlineEditableProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const originalValueRef = useRef(value)
  const [editing, setEditing] = useState(false)
  const lastTouchRef = useRef(0)
  const touchHandledRef = useRef(false)
  const autoEditDone = useRef(false)

  // Sync prop → DOM only when NOT editing
  useEffect(() => {
    if (!ref.current) return
    if (editing) return
    ref.current.innerText = value
  }, [value, editing])

  const enterEditMode = useCallback(() => {
    setEditing(true)
    originalValueRef.current = ref.current?.innerText ?? value
    onEditStart?.()
    // Focus after React re-renders with contentEditable=true
    requestAnimationFrame(() => {
      if (!ref.current) return
      ref.current.focus()
      // Place caret at end
      const sel = window.getSelection()
      if (sel) {
        sel.selectAllChildren(ref.current)
        sel.collapseToEnd()
      }
    })
  }, [value, onEditStart])

  // Auto-enter edit mode on mount if requested
  useEffect(() => {
    if (autoEdit && !autoEditDone.current) {
      autoEditDone.current = true
      enterEditMode()
    }
  }, [autoEdit, enterEditMode])

  // Touch-based double-tap detection (fires immediately, no 300ms delay)
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (editing) return

    const now = Date.now()
    if (now - lastTouchRef.current < DOUBLE_TAP_MS) {
      // Double-tap detected
      e.preventDefault() // Prevent zoom and synthetic click
      e.stopPropagation()
      lastTouchRef.current = 0
      touchHandledRef.current = true
      enterEditMode()
    } else {
      lastTouchRef.current = now
      touchHandledRef.current = false
    }
  }, [editing, enterEditMode])

  // Desktop double-click fallback
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (editing) return
    // Skip if touch already handled this
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    e.stopPropagation()
    enterEditMode()
  }, [editing, enterEditMode])

  // Stop clicks from bubbling when actively editing
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (editing) {
      e.stopPropagation()
    }
  }, [editing])

  const handleBlur = useCallback(() => {
    if (!editing) return
    const text = ref.current?.innerText ?? ""
    setEditing(false)
    onCommit(text)
    onEditEnd?.()
  }, [editing, onCommit, onEditEnd])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (!editing) return
      if (e.key === "Enter") {
        if (!multiline) {
          e.preventDefault()
          ref.current?.blur()
        }
        // multiline: allow default newline insertion
      } else if (e.key === "Escape") {
        // Restore original value and blur
        if (ref.current) {
          ref.current.innerText = originalValueRef.current
        }
        ref.current?.blur()
      }
    },
    [multiline, editing]
  )

  // Scroll the caret into view as the user types (keeps cursor visible when text grows)
  const handleInput = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const marker = document.createElement('span')
    range.insertNode(marker)
    marker.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    marker.parentNode?.removeChild(marker)
    sel.collapseToEnd()
  }, [])

  return (
    <span
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "empty:before:content-[attr(data-placeholder)] empty:before:opacity-40",
        editing ? "cursor-text" : "cursor-default",
        "touch-manipulation",
        className
      )}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
    />
  )
}

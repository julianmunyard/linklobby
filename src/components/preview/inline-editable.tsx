"use client"

import { useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface InlineEditableProps {
  value: string
  onCommit: (value: string) => void
  multiline?: boolean
  className?: string
  placeholder?: string
  onEditStart?: () => void
  onEditEnd?: () => void
}

/**
 * Uncontrolled contentEditable wrapper with ref-based approach.
 * Syncs prop value to DOM only when not focused.
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
}: InlineEditableProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const originalValueRef = useRef(value)

  // Sync prop → DOM only when NOT focused
  useEffect(() => {
    if (!ref.current) return
    if (document.activeElement === ref.current) return
    ref.current.innerText = value
  }, [value])

  const handleFocus = useCallback(() => {
    // Save original value for Escape cancellation
    originalValueRef.current = ref.current?.innerText ?? value
    onEditStart?.()
  }, [value, onEditStart])

  const handleBlur = useCallback(() => {
    const text = ref.current?.innerText ?? ""
    onCommit(text)
    onEditEnd?.()
  }, [onCommit, onEditEnd])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
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
    [multiline]
  )

  // Scroll the caret into view as the user types (keeps cursor visible when text grows)
  const handleInput = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.bottom > window.innerHeight - 20) {
      window.scrollBy({ top: rect.bottom - window.innerHeight + 40, behavior: 'smooth' })
    }
  }, [])

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(className)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
    />
  )
}

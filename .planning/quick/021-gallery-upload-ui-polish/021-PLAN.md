---
phase: quick
plan: 021
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/editor/gallery-card-fields.tsx
autonomous: true

must_haves:
  truths:
    - "No browser default 'Choose File' input visible"
    - "Plus icon button triggers file selection"
    - "Empty state shows plus button centered"
    - "Add-more state shows plus button inline with image list"
  artifacts:
    - path: "src/components/editor/gallery-card-fields.tsx"
      provides: "Styled plus button for image upload"
      contains: "Plus"
  key_links:
    - from: "Button click"
      to: "Hidden file input"
      via: "inputRef.current?.click()"
      pattern: "inputRef.*click"
---

<objective>
Replace ugly browser default file input with a clean plus icon button for gallery image uploads.

Purpose: The default "Choose File" input looks dated and breaks the editor aesthetic. A plus icon button is cleaner and more intuitive.
Output: Polished gallery upload UI with hidden file input triggered by styled button.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/editor/gallery-card-fields.tsx
@src/components/ui/button.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace file input with plus icon button</name>
  <files>src/components/editor/gallery-card-fields.tsx</files>
  <action>
Replace the default file input with a hidden input + styled plus button pattern:

1. Add useRef for the hidden file input:
   - `const fileInputRef = useRef<HTMLInputElement>(null)`
   - Import useRef from react

2. Import Plus icon from lucide-react (already has other icons imported)

3. Import Button from @/components/ui/button

4. Replace the "Add Images" section (lines 371-393) with:
   - Hidden file input (sr-only class, ref={fileInputRef})
   - Button with variant="outline" size="sm" that calls fileInputRef.current?.click()
   - Plus icon inside button with text "Add Image" (or just icon if compact)
   - Keep the Loader2 spinner and error display

5. Replace the empty state (lines 395-401) with:
   - Keep the border-dashed container
   - Replace the ImageIcon + text with a larger plus button
   - Button should be variant="outline" with Plus icon
   - Add "Add Images" text below the button
   - Keep the "Add up to 10 images" helper text
   - Button should trigger the same fileInputRef.current?.click()

Design guidance:
- Empty state: Larger button (size="lg" or custom sizing), centered, with Plus icon and "Add Images" text
- Add-more state: Smaller button (size="sm"), appears below the image list, just Plus icon or "Add" text
- Both states share the same hidden file input
- Maintain all existing upload logic (handleFileSelect, isUploading states, etc.)
  </action>
  <verify>
    - npm run build passes
    - In browser: Select gallery card with no images - see centered plus button, not file input
    - Click plus button - file picker opens
    - Add an image - now shows image list with smaller plus button below
    - Click smaller plus button - file picker opens again
  </verify>
  <done>
    - Browser default "Choose File" input is completely hidden
    - Empty state shows clean plus button centered in dashed border area
    - Add-more state shows smaller plus button below image list
    - Both buttons trigger file selection correctly
  </done>
</task>

</tasks>

<verification>
- No visible browser default file input anywhere in gallery card editor
- Plus buttons are styled consistently with editor aesthetic
- Upload functionality unchanged (multi-file, compression, error handling)
</verification>

<success_criteria>
- Gallery card editor shows styled plus buttons instead of "Choose File"
- Empty state and add-more state both work correctly
- Build passes with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/021-gallery-upload-ui-polish/021-SUMMARY.md`
</output>

# Phase 4: Basic Cards - Research

**Researched:** 2026-01-24
**Domain:** React Card Components + Supabase Image Storage + Property Editing
**Confidence:** HIGH

## Summary

This phase implements the three foundational card types (Hero Card, Horizontal Link, Square Card) along with image upload to Supabase Storage and a sidebar property editor for card configuration. The existing codebase from Phase 3 provides solid foundations: card type definitions, CRUD API routes, page store with selectedCardId, and a preview system.

The implementation follows a component-per-card-type pattern with shared utilities for image handling. Image uploads use Supabase Storage with client-side upload and URL storage in the card's content JSONB field. Property editing uses react-hook-form with shadcn/ui Form components already present in the codebase, displayed in a Sheet or inline panel when a card is selected.

**Primary recommendation:** Build card-specific render components that consume card data, a shared ImageUpload component wrapping Supabase Storage, and a CardPropertyEditor that switches fields based on card_type.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.1 | Form state management | Already used in codebase, integrates with shadcn/ui |
| zod | ^4.3.6 | Schema validation | Already installed, type-safe validation |
| @hookform/resolvers | ^5.2.2 | Zod resolver for forms | Connects zod schemas to react-hook-form |
| @supabase/supabase-js | ^2.91.0 | Storage uploads | Client-side file upload API |
| lucide-react | ^0.562.0 | Icons | Already in use throughout codebase |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Sheet | installed | Slide-out panel | Card property editing panel |
| shadcn/ui Form | installed | Form components | FormField, FormItem, FormLabel, FormControl |
| shadcn/ui Input | installed | Text inputs | Title, URL, description fields |
| next/image | built-in | Image optimization | Rendering uploaded images |

### To Add
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Textarea | not yet | Multi-line text | Card description field |

**Installation:**
```bash
npx shadcn@latest add textarea
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── cards/
│   │   ├── hero-card.tsx           # Hero card render component
│   │   ├── horizontal-link.tsx     # Horizontal link render component
│   │   ├── square-card.tsx         # Square card render component
│   │   ├── card-renderer.tsx       # Switch component by card_type
│   │   └── image-upload.tsx        # Shared image upload component
│   ├── editor/
│   │   ├── card-property-editor.tsx  # Main property editor
│   │   ├── hero-card-fields.tsx      # Hero-specific form fields
│   │   ├── horizontal-link-fields.tsx # Horizontal-specific fields
│   │   └── square-card-fields.tsx     # Square-specific fields
│   └── canvas/
│       └── ... (existing)
├── lib/
│   └── supabase/
│       └── storage.ts              # Storage upload helpers
└── types/
    └── card.ts                     # Extended content types
```

### Pattern 1: Component-Per-Card-Type with Renderer Switch
**What:** Each card type has its own component; a CardRenderer switches based on type
**When to use:** When card types have meaningfully different layouts
**Example:**
```typescript
// src/components/cards/card-renderer.tsx
import { HeroCard } from "./hero-card"
import { HorizontalLink } from "./horizontal-link"
import { SquareCard } from "./square-card"
import type { Card } from "@/types/card"

interface CardRendererProps {
  card: Card
  isPreview?: boolean  // Different styling in preview vs editor
}

export function CardRenderer({ card, isPreview = false }: CardRendererProps) {
  switch (card.card_type) {
    case "hero":
      return <HeroCard card={card} isPreview={isPreview} />
    case "horizontal":
      return <HorizontalLink card={card} isPreview={isPreview} />
    case "square":
      return <SquareCard card={card} isPreview={isPreview} />
    default:
      return null // Or a fallback component
  }
}
```

### Pattern 2: JSONB Content Schema per Card Type
**What:** Each card type defines its content structure; common fields stay at top level
**When to use:** When card types have type-specific data beyond common fields
**Example:**
```typescript
// src/types/card.ts
export interface HeroCardContent {
  imageUrl?: string
  imageAlt?: string
  buttonText?: string
  buttonStyle?: "primary" | "secondary" | "outline"
}

export interface HorizontalLinkContent {
  imageUrl?: string
  imageAlt?: string
  iconName?: string  // Lucide icon name alternative to image
}

export interface SquareCardContent {
  imageUrl?: string
  imageAlt?: string
  showTitle?: boolean  // Optional title overlay toggle
}

export type CardContent = HeroCardContent | HorizontalLinkContent | SquareCardContent
```

### Pattern 3: Controlled Form with Optimistic Updates
**What:** Form changes update local store immediately, debounce persist to DB
**When to use:** For responsive property editing without save button
**Example:**
```typescript
// Card property editor with optimistic updates
const { updateCard } = usePageStore()

const form = useForm({
  resolver: zodResolver(cardSchema),
  defaultValues: { title, description, url, ...content },
})

// Watch form and update store on change
useEffect(() => {
  const subscription = form.watch((values) => {
    updateCard(cardId, {
      title: values.title,
      description: values.description,
      url: values.url,
      content: { ...values }, // Spread content fields
    })
  })
  return () => subscription.unsubscribe()
}, [form, cardId, updateCard])
```

### Pattern 4: Stretched Link for Clickable Cards
**What:** Make entire card clickable using pseudo-element stretched over card
**When to use:** For link cards that need full-area click targets
**Example:**
```typescript
// Clickable card with stretched link
<div className="relative rounded-lg overflow-hidden">
  <div className="p-4">
    <h3 className="font-medium">{title}</h3>
    {url && (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="after:absolute after:inset-0"
      >
        <span className="sr-only">Visit {title}</span>
      </a>
    )}
  </div>
</div>
```

### Anti-Patterns to Avoid
- **Putting form state in Zustand:** Use react-hook-form for form state, Zustand for card data
- **Uploading images on every keystroke:** Debounce or use explicit upload trigger
- **Storing base64 images in database:** Always use Supabase Storage URLs
- **Mixing editor and preview rendering:** Use isPreview prop to conditionally show edit controls

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image upload to Supabase | Custom fetch with FormData | `supabase.storage.from().upload()` | Handles auth, CORS, content types |
| Form validation | Manual if/else checks | zod + react-hook-form | Type safety, error messages |
| Image optimization | Manual resizing | next/image + Supabase transforms | Automatic format, lazy loading |
| Unique filenames | Date.now() + Math.random() | crypto.randomUUID() | Truly unique, no collisions |
| Debounced save | Custom setTimeout | Use existing hasChanges + save pattern | Already in useCards hook |

**Key insight:** The codebase already has form infrastructure (shadcn/ui Form + react-hook-form). Image upload is the only genuinely new capability needed.

## Common Pitfalls

### Pitfall 1: Supabase Storage Bucket Not Configured
**What goes wrong:** Uploads fail with 400 or 401 errors
**Why it happens:** Storage bucket doesn't exist or RLS policies not set
**How to avoid:** Create bucket in Supabase dashboard, set RLS policy for authenticated users
**Warning signs:** "Bucket not found" or "Not authorized" errors in console

### Pitfall 2: Image URL Not Persisting
**What goes wrong:** Image shows during session but gone on reload
**Why it happens:** URL not saved to card.content in database
**How to avoid:** After upload success, update card.content.imageUrl and persist via API
**Warning signs:** hasChanges stays true, image disappears on page refresh

### Pitfall 3: Form Default Values Not Syncing
**What goes wrong:** Editing one card shows previous card's values
**Why it happens:** useForm defaultValues only used on mount
**How to avoid:** Use form.reset() with new values when selectedCardId changes
**Warning signs:** Wrong title/URL showing when selecting different cards

### Pitfall 4: Editor and Preview Out of Sync
**What goes wrong:** Changes in editor don't appear in preview iframe
**Why it happens:** Preview not receiving STATE_UPDATE messages
**How to avoid:** Zustand subscription in preview-panel.tsx already handles this - verify store updates trigger subscription
**Warning signs:** Preview stays stale while editor shows new content

### Pitfall 5: Large Image Uploads Failing
**What goes wrong:** Upload hangs or times out for large images
**Why it happens:** Standard upload has 6MB practical limit
**How to avoid:** Validate file size client-side before upload, show error for files > 5MB
**Warning signs:** Upload spinner never completes for large photos

## Code Examples

Verified patterns from official sources:

### Supabase Storage Upload (Client-Side)
```typescript
// Source: https://supabase.com/docs/guides/storage/uploads/standard-uploads
import { createClient } from "@/lib/supabase/client"

export async function uploadCardImage(file: File, cardId: string): Promise<string> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${cardId}/${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false, // Don't overwrite
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('card-images')
    .getPublicUrl(data.path)

  return publicUrl
}
```

### ImageUpload Component Pattern
```typescript
// Image upload with preview
interface ImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error("File must be an image")
      return
    }

    try {
      setIsUploading(true)
      const url = await uploadCardImage(file, cardId)
      onChange(url)
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image src={value} alt="" fill className="object-cover" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(undefined)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
```

### react-hook-form with shadcn/ui
```typescript
// Source: Existing codebase pattern (src/components/ui/form.tsx)
const form = useForm<CardFormValues>({
  resolver: zodResolver(cardFormSchema),
  defaultValues: {
    title: card.title ?? "",
    description: card.description ?? "",
    url: card.url ?? "",
  },
})

return (
  <Form {...form}>
    <form className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter title..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>
)
```

### Hero Card Component
```typescript
// Large prominent CTA card
interface HeroCardProps {
  card: Card
  isPreview?: boolean
}

export function HeroCard({ card, isPreview }: HeroCardProps) {
  const content = card.content as HeroCardContent

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-card border">
      {content.imageUrl ? (
        <Image
          src={content.imageUrl}
          alt={content.imageAlt || card.title || ""}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {card.title && (
          <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
        )}
        {card.description && (
          <p className="text-sm opacity-90 mb-4">{card.description}</p>
        )}
        {card.url && (
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90"
          >
            {content.buttonText || "Visit"}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Stretched link for full-card click */}
      {card.url && !content.buttonText && (
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
        >
          <span className="sr-only">Visit {card.title}</span>
        </a>
      )}
    </div>
  )
}
```

### Horizontal Link Component
```typescript
// Linktree-style wide bar
interface HorizontalLinkProps {
  card: Card
  isPreview?: boolean
}

export function HorizontalLink({ card, isPreview }: HorizontalLinkProps) {
  const content = card.content as HorizontalLinkContent

  return (
    <a
      href={card.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex items-center gap-4 w-full p-4 rounded-lg border bg-card",
        "hover:bg-accent hover:border-accent-foreground/20 transition-colors",
        !card.url && "pointer-events-none"
      )}
    >
      {/* Image or icon */}
      {content.imageUrl ? (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={content.imageUrl}
            alt={content.imageAlt || ""}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{card.title || "Untitled"}</h3>
        {card.description && (
          <p className="text-sm text-muted-foreground truncate">
            {card.description}
          </p>
        )}
      </div>

      {/* Arrow indicator */}
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </a>
  )
}
```

### Square Card Component
```typescript
// Small tile card
interface SquareCardProps {
  card: Card
  isPreview?: boolean
}

export function SquareCard({ card, isPreview }: SquareCardProps) {
  const content = card.content as SquareCardContent

  return (
    <a
      href={card.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative block aspect-square w-full rounded-lg border bg-card overflow-hidden",
        "hover:border-accent-foreground/20 transition-colors",
        !card.url && "pointer-events-none"
      )}
    >
      {content.imageUrl ? (
        <Image
          src={content.imageUrl}
          alt={content.imageAlt || card.title || ""}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Title overlay */}
      {card.title && (content.showTitle !== false) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-medium text-white truncate">
              {card.title}
            </h3>
          </div>
        </>
      )}
    </a>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FormField wrapper | Controller + Field components | shadcn/ui 2024 | More explicit, less magic |
| Base64 in database | Object storage URLs | Standard practice | Much better performance |
| Save button forms | Auto-save with debounce | UX trend 2023+ | More responsive editing |
| Fixed card sizes | Tailwind responsive classes | Always | Mobile-first responsive |

**Deprecated/outdated:**
- Storing images as base64 in JSONB: Use Supabase Storage URLs
- useFieldArray for static forms: Only needed for dynamic field lists

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase Storage Bucket Name**
   - What we know: Need a bucket for card images
   - What's unclear: Whether bucket exists, what name to use
   - Recommendation: Use `card-images` bucket, document setup in PLAN.md

2. **Image Resize on Upload vs. Render**
   - What we know: Supabase offers image transformations on Pro plan
   - What's unclear: Current plan tier
   - Recommendation: Start with client-side validation (5MB max), use next/image for render optimization

3. **Auto-Save Debounce Duration**
   - What we know: Need to balance responsiveness vs. API calls
   - What's unclear: Ideal timing for this UX
   - Recommendation: Start with 1 second debounce, adjust based on testing

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/src/components/ui/form.tsx`, `/src/lib/supabase/cards.ts`
- Supabase Storage docs: https://supabase.com/docs/guides/storage/uploads/standard-uploads
- Supabase Image Transformations: https://supabase.com/docs/guides/storage/serving/image-transformations

### Secondary (MEDIUM confidence)
- shadcn/ui Form patterns: https://ui.shadcn.com/docs/components/form
- shadcn/ui Sheet component: https://ui.shadcn.com/docs/components/sheet
- Stretched link pattern: https://getbootstrap.com/docs/4.4/utilities/stretched-link/

### Tertiary (LOW confidence)
- Card design patterns from various sources - patterns synthesized from multiple blog posts

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already installed in codebase, verified versions
- Architecture: HIGH - Patterns derived from existing codebase structure
- Pitfalls: MEDIUM - Based on common patterns, some Supabase-specific from docs
- Code examples: HIGH - Derived from codebase patterns and official docs

**Research date:** 2026-01-24
**Valid until:** 30 days (stable domain, well-established patterns)

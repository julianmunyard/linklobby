// src/types/linktree.ts
import { z } from 'zod'

// Individual link schema - matches Linktree's link structure
// Made permissive to handle variations in Linktree's data
// Using passthrough() to allow extra fields Linktree might add
export const LinktreeLinkSchema = z.object({
  id: z.union([z.number(), z.string()]), // Can be number or string
  title: z.string().nullable().optional().default(''), // Can be null
  url: z.string(), // Don't validate as URL - Linktree might have special URLs
  type: z.string().optional().nullable(), // 'HEADER', 'CLASSIC', etc.
  position: z.number().optional().nullable().default(0),
  thumbnail: z.string().optional().nullable(),
  locked: z.boolean().optional().nullable(), // Can be null
}).passthrough()

// Social link schema - matches Linktree's socialLinks structure
export const LinktreeSocialLinkSchema = z.object({
  type: z.string(), // e.g., "INSTAGRAM", "TIKTOK", "YOUTUBE", "SPOTIFY", "TWITTER"
  url: z.string(),
}).passthrough()

// Account schema - permissive
const LinktreeAccountSchema = z.object({
  username: z.string(),
  pageTitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tier: z.string().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  profilePictureUrl: z.string().optional().nullable(), // Don't validate as URL
}).passthrough()

// Main data schema - validates __NEXT_DATA__.props.pageProps
// passthrough allows the many extra fields Linktree includes
export const LinktreePagePropsSchema = z.object({
  account: LinktreeAccountSchema.optional(),
  links: z.array(LinktreeLinkSchema),
  socialLinks: z.array(LinktreeSocialLinkSchema).optional(),
}).passthrough()

// Full __NEXT_DATA__ schema
export const LinktreeDataSchema = z.object({
  props: z.object({
    pageProps: LinktreePagePropsSchema,
  }).passthrough(),
}).passthrough()

// Export types
export type LinktreeData = z.infer<typeof LinktreeDataSchema>
export type LinktreeLink = z.infer<typeof LinktreeLinkSchema>
export type LinktreeSocialLink = z.infer<typeof LinktreeSocialLinkSchema>
export type LinktreePageProps = z.infer<typeof LinktreePagePropsSchema>

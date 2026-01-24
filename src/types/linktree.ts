// src/types/linktree.ts
import { z } from 'zod'

// Individual link schema - matches Linktree's link structure
export const LinktreeLinkSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string().url(),
  type: z.string().optional(), // 'HEADER', 'CLASSIC', etc. - we'll ignore this per CONTEXT.md
  position: z.number(),
  thumbnail: z.string().url().optional().nullable(),
  locked: z.boolean().optional(),
})

// Account schema
const LinktreeAccountSchema = z.object({
  username: z.string(),
  pageTitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tier: z.string().optional(),
  isActive: z.boolean().optional(),
  profilePictureUrl: z.string().url().optional().nullable(),
})

// Main data schema - validates __NEXT_DATA__.props.pageProps
export const LinktreePagePropsSchema = z.object({
  account: LinktreeAccountSchema.optional(),
  links: z.array(LinktreeLinkSchema),
  socialLinks: z.array(z.any()).optional(),
})

// Full __NEXT_DATA__ schema
export const LinktreeDataSchema = z.object({
  props: z.object({
    pageProps: LinktreePagePropsSchema,
  }),
})

// Export types
export type LinktreeData = z.infer<typeof LinktreeDataSchema>
export type LinktreeLink = z.infer<typeof LinktreeLinkSchema>
export type LinktreePageProps = z.infer<typeof LinktreePagePropsSchema>

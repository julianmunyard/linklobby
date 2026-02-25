// POST /api/emails - collect email from visitor (public endpoint)

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { emailCollectionRatelimit, checkRateLimit, getClientIp } from '@/lib/ratelimit'

// Validation schema
const emailSubmissionSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().max(255).optional(),
  pageId: z.string().uuid('Invalid page ID'),
  cardId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limit by IP — this is a public endpoint
    const ip = getClientIp(request)
    const rl = await checkRateLimit(emailCollectionRatelimit, ip)
    if (!rl.allowed) return rl.response!

    const body = await request.json()

    // Validate input
    const result = emailSubmissionSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { email, name, pageId, cardId } = result.data

    // Create Supabase client
    const supabase = await createClient()

    // Insert email into collected_emails table
    const { error: insertError } = await supabase
      .from('collected_emails')
      .insert({
        page_id: pageId,
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        source_card_id: cardId || null,
      })

    // Handle duplicate email (UNIQUE constraint violation)
    if (insertError) {
      // Postgres unique violation error code
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: true, alreadySubscribed: true },
          { status: 200 }
        )
      }

      console.error('Error inserting email:', insertError)
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing email submission:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

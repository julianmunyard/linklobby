// src/lib/supabase/cards.ts
import { createClient } from "@/lib/supabase/server"
import type { Card, CardType, CardSize, HorizontalPosition } from "@/types/card"
import { POSITION_REVERSE, POSITION_MAP } from "@/types/card"

// Helper to migrate legacy size values
function mapLegacySize(size: string | null | undefined): CardSize {
  if (size === 'small') return 'small'
  return 'big' // 'big', 'large', 'medium', null all map to full width
}

// Map database row to Card type
function mapDbToCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as string,
    page_id: row.page_id as string,
    card_type: row.card_type as CardType,
    title: row.title as string | null,
    description: row.description as string | null,
    url: row.url as string | null,
    content: (row.content as Record<string, unknown>) || {},
    size: mapLegacySize(row.size as string),
    position: POSITION_REVERSE[(row.position_x as number) ?? 0] || 'left',
    sortKey: row.sort_key as string,
    is_visible: row.is_visible as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

// Map Card to database columns
function mapCardToDb(card: Partial<Card>) {
  const dbCard: Record<string, unknown> = {}
  if (card.page_id !== undefined) dbCard.page_id = card.page_id
  if (card.card_type !== undefined) dbCard.card_type = card.card_type
  if (card.title !== undefined) dbCard.title = card.title
  if (card.description !== undefined) dbCard.description = card.description
  if (card.url !== undefined) dbCard.url = card.url
  if (card.content !== undefined) dbCard.content = card.content
  if (card.size !== undefined) dbCard.size = card.size
  if (card.position !== undefined) dbCard.position_x = POSITION_MAP[card.position]
  if (card.sortKey !== undefined) dbCard.sort_key = card.sortKey
  if (card.is_visible !== undefined) dbCard.is_visible = card.is_visible
  return dbCard
}

export async function fetchCards(pageId: string): Promise<Card[]> {
  const supabase = await createClient()

  // Fetch without DB-level ordering - we sort in JavaScript instead
  // This ensures consistent lexicographic sorting that matches the preview
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("page_id", pageId)

  if (error) throw error

  // Map and sort using JavaScript's lexicographic comparison
  const cards = (data || []).map(mapDbToCard)
  return cards.sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  )
}

export async function createCard(
  card: Omit<Card, "id" | "created_at" | "updated_at">
): Promise<Card> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cards")
    .insert(mapCardToDb(card))
    .select()
    .single()

  if (error) throw error
  return mapDbToCard(data)
}

export async function updateCard(
  id: string,
  updates: Partial<Card>
): Promise<Card> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cards")
    .update({ ...mapCardToDb(updates), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return mapDbToCard(data)
}

export async function upsertCard(
  id: string,
  card: Partial<Card> & { page_id: string }
): Promise<Card> {
  const supabase = await createClient()

  const dbCard = {
    id,
    ...mapCardToDb(card),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("cards")
    .upsert(dbCard, { onConflict: "id" })
    .select()
    .single()

  if (error) throw error
  return mapDbToCard(data)
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("cards").delete().eq("id", id)

  if (error) throw error
}

export async function fetchUserPage(): Promise<{ id: string } | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (error) return null
  return data
}

// src/lib/supabase/cards.ts
import { createClient } from "@/lib/supabase/server"
import type { Card, CardType, CardSize } from "@/types/card"

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
    size: (row.size as CardSize) || "medium",
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
  if (card.sortKey !== undefined) dbCard.sort_key = card.sortKey
  if (card.is_visible !== undefined) dbCard.is_visible = card.is_visible
  return dbCard
}

export async function fetchCards(pageId: string): Promise<Card[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_key", { ascending: true })

  if (error) throw error
  return (data || []).map(mapDbToCard)
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

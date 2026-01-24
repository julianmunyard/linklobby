// PATCH /api/cards/[id] - update a card
// DELETE /api/cards/[id] - delete a card

import { NextResponse } from "next/server"
import { updateCard, deleteCard, fetchUserPage } from "@/lib/supabase/cards"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    const card = await updateCard(id, updates)
    return NextResponse.json({ card })
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    await deleteCard(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    )
  }
}

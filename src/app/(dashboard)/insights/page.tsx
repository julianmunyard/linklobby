import { redirect } from "next/navigation"

export default function InsightsPage() {
  redirect("/editor?tab=insights")
}

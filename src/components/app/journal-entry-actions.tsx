"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { postJournalEntryAction, cancelJournalEntryAction } from "@/lib/actions/finance"
import { Button } from "@/components/ui/button"

interface Props { entryId: string; status: string }

export function JournalEntryActions({ entryId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handle(action: "post" | "cancel") {
    setLoading(action)
    try {
      if (action === "post") {
        await postJournalEntryAction(entryId)
        toast.success("Entry posted")
      } else {
        await cancelJournalEntryAction(entryId)
        toast.success("Entry cancelled")
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Action failed")
    } finally {
      setLoading(null)
    }
  }

  if (status === "posted" || status === "cancelled") return null

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        disabled={!!loading}
        onClick={() => handle("post")}
        className="bg-teal-600 hover:bg-teal-700"
      >
        {loading === "post" ? "Posting..." : "Post Entry"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!!loading}
        onClick={() => handle("cancel")}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        {loading === "cancel" ? "Cancelling..." : "Cancel Entry"}
      </Button>
    </div>
  )
}

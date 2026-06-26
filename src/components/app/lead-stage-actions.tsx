"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateLeadStageAction } from "@/lib/actions/crm"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const TRANSITIONS: Record<string, { label: string; next: string; variant: "primary" | "ghost" | "danger" }[]> = {
  new:         [{ label: "Qualify", next: "qualified", variant: "primary" }, { label: "Mark Lost", next: "lost", variant: "danger" }],
  qualified:   [{ label: "Send Proposal", next: "proposal", variant: "primary" }, { label: "Mark Lost", next: "lost", variant: "danger" }],
  proposal:    [{ label: "Start Negotiation", next: "negotiation", variant: "primary" }, { label: "Mark Won", next: "won", variant: "ghost" }, { label: "Mark Lost", next: "lost", variant: "danger" }],
  negotiation: [{ label: "Mark Won", next: "won", variant: "primary" }, { label: "Mark Lost", next: "lost", variant: "danger" }],
  won:         [],
  lost:        [{ label: "Reopen as New", next: "new", variant: "ghost" }],
}

interface Props { leadId: string; currentStage: string }

export function LeadStageActions({ leadId, currentStage }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const actions = TRANSITIONS[currentStage] ?? []

  if (actions.length === 0) return null

  const [primary, ...secondary] = actions

  async function move(stage: string) {
    setLoading(stage)
    setOpen(false)
    try {
      await updateLeadStageAction(leadId, stage)
      toast.success(`Lead moved to ${stage}`)
      router.refresh()
    } catch {
      toast.error("Failed to update stage")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2 relative">
      {/* Primary action */}
      <div className="flex">
        <Button
          size="sm"
          disabled={!!loading}
          onClick={() => move(primary.next)}
          className={
            primary.variant === "danger"
              ? "bg-red-600 hover:bg-red-700 rounded-r-none"
              : "bg-teal-600 hover:bg-teal-700 rounded-r-none"
          }
        >
          {loading === primary.next ? "Updating…" : primary.label}
        </Button>

        {secondary.length > 0 && (
          <Button
            size="sm"
            disabled={!!loading}
            onClick={() => setOpen((o) => !o)}
            className={
              primary.variant === "danger"
                ? "bg-red-600 hover:bg-red-700 border-l border-red-500 rounded-l-none px-2"
                : "bg-teal-600 hover:bg-teal-700 border-l border-teal-500 rounded-l-none px-2"
            }
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {open && secondary.length > 0 && (
        <div className="absolute top-full right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-44">
          {secondary.map((a) => (
            <button
              key={a.next}
              type="button"
              disabled={!!loading}
              onClick={() => move(a.next)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                a.variant === "danger" ? "text-red-600" : "text-slate-700"
              }`}
            >
              {loading === a.next ? "Updating…" : a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

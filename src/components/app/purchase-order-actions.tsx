"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { updatePurchaseOrderStatusAction } from "@/lib/actions/purchase"

type Status = "rfq" | "rfq_sent" | "purchase_order" | "done" | "cancelled"

const TRANSITIONS: Record<Status, { label: string; next: Status }[]> = {
  rfq:            [{ label: "Send RFQ", next: "rfq_sent" }, { label: "Confirm as PO", next: "purchase_order" }, { label: "Cancel", next: "cancelled" }],
  rfq_sent:       [{ label: "Confirm Order", next: "purchase_order" }, { label: "Cancel", next: "cancelled" }],
  purchase_order: [{ label: "Mark as Done", next: "done" }, { label: "Cancel", next: "cancelled" }],
  done:           [],
  cancelled:      [{ label: "Reopen as RFQ", next: "rfq" }],
}

export function PurchaseOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const actions = TRANSITIONS[currentStatus as Status] ?? []
  if (actions.length === 0) return null

  async function handleAction(next: Status) {
    setLoading(true)
    setOpen(false)
    try {
      await updatePurchaseOrderStatusAction(orderId, next)
      toast.success("Status updated")
      router.refresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  if (actions.length === 1) {
    const [action] = actions
    const isCancel = action.next === "cancelled"
    return (
      <button
        onClick={() => handleAction(action.next)}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          isCancel
            ? "border border-red-200 text-red-600 hover:bg-red-50"
            : "bg-teal-600 hover:bg-teal-700 text-white"
        }`}
      >
        {loading ? "..." : action.label}
      </button>
    )
  }

  const [primary, ...rest] = actions
  return (
    <div className="relative flex">
      <button
        onClick={() => handleAction(primary.next)}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-l-lg transition-colors disabled:opacity-50"
      >
        {loading ? "..." : primary.label}
      </button>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center px-2 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-r-lg border-l border-teal-500 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-40 overflow-hidden">
            {rest.map((a) => (
              <button
                key={a.next}
                onClick={() => handleAction(a.next)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                  a.next === "cancelled" ? "text-red-600" : "text-slate-700"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { requireTenantSession } from "@/lib/auth/session"
import { getPurchaseOrders } from "@/lib/db/purchase"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_STYLE: Record<string, string> = {
  rfq:            "bg-slate-100 text-slate-600",
  rfq_sent:       "bg-blue-100 text-blue-700",
  purchase_order: "bg-teal-100 text-teal-700",
  done:           "bg-green-100 text-green-700",
  cancelled:      "bg-red-100 text-red-600",
}

const STATUS_LABEL: Record<string, string> = {
  rfq:            "RFQ",
  rfq_sent:       "RFQ Sent",
  purchase_order: "Purchase Order",
  done:           "Done",
  cancelled:      "Cancelled",
}

export default async function PurchasePage() {
  const session = await requireTenantSession()
  const orders = await getPurchaseOrders(session.companyId!)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} orders</p>
        </div>
        <Link href="/purchase/new">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-1" /> New PO
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">PO #</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Vendor</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/purchase/${o.id}`} className="font-mono text-xs text-teal-700 hover:underline font-medium">
                    {o.order_no}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-700">{o.vendor?.name ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(o.order_date)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium text-slate-900">{formatCurrency(o.total ?? 0)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                  <p className="text-base mb-1">No purchase orders yet</p>
                  <p className="text-xs">Create your first PO to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

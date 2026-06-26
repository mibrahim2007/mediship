import { requireTenantSession } from "@/lib/auth/session"
import { getPurchaseOrderById } from "@/lib/db/purchase"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Pencil } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PurchaseOrderActions } from "@/components/app/purchase-order-actions"

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

export default async function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const order = await getPurchaseOrderById(params.id, session.companyId!)
  if (!order) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/purchase" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{order.order_no}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Created {formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["rfq", "rfq_sent"].includes(order.status) && (
            <Link
              href={`/purchase/${order.id}/edit`}
              className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">
            <Printer className="h-4 w-4" /> Print
          </button>
          <PurchaseOrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Vendor", value: (order as any).vendor?.name ?? "—" },
          { label: "Order Date", value: formatDate(order.order_date) },
          { label: "Delivery Deadline", value: order.order_deadline ? formatDate(order.order_deadline) : "—" },
          { label: "Payment Terms", value: order.payment_terms ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">Products to Order</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-2 text-slate-500 font-medium">#</th>
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Product / Description</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Qty</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Received</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">UoM</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Unit Cost</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Tax%</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l: any, i: number) => (
              <tr key={l.id} className="border-b border-slate-50">
                <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-800">{l.products?.name ?? l.description ?? "—"}</p>
                  {l.products?.name && l.description && l.description !== l.products.name && (
                    <p className="text-xs text-slate-400">{l.description}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-slate-700">{l.quantity}</td>
                <td className="px-5 py-3 text-right">
                  <span className={l.received_qty >= l.quantity ? "text-green-600 font-medium" : "text-slate-500"}>
                    {l.received_qty ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-500">{l.uom ?? l.products?.uom ?? "—"}</td>
                <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(l.unit_price)}</td>
                <td className="px-5 py-3 text-right text-slate-500">{l.tax_rate ? `${l.tax_rate}%` : "—"}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-900">{formatCurrency(l.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax</span><span>{formatCurrency(order.tax_amount ?? 0)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
            <span>Total</span><span>{formatCurrency(order.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
          <p className="text-sm text-amber-800">{order.notes}</p>
        </div>
      )}
    </div>
  )
}

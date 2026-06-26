import { requireTenantSession } from "@/lib/auth/session"
import { getProductById, getStockLevels, getStockMovesByProduct } from "@/lib/db/inventory"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, SlidersHorizontal, Package, TrendingUp, TrendingDown, AlertTriangle, Pencil } from "lucide-react"
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

const MOVE_TYPE_LABEL: Record<string, string> = {
  purchase:   "Purchase Receipt",
  sale:       "Sales Shipment",
  adjustment: "Adjustment",
  transfer:   "Transfer",
  return:     "Return",
}

const MOVE_TYPE_COLOR: Record<string, string> = {
  purchase:   "bg-teal-100 text-teal-700",
  sale:       "bg-blue-100 text-blue-700",
  adjustment: "bg-slate-100 text-slate-600",
  transfer:   "bg-purple-100 text-purple-700",
  return:     "bg-amber-100 text-amber-700",
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const [product, stockLevels, moves] = await Promise.all([
    getProductById(params.id, session.companyId!),
    getStockLevels(session.companyId!),
    getStockMovesByProduct(params.id, session.companyId!),
  ])
  if (!product) notFound()

  const onHand = stockLevels[product.id] ?? 0
  const isLow  = product.reorder_point > 0 && onHand <= product.reorder_point
  const stockValue = onHand * (product.cost_price ?? 0)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/stocks" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {product.internal_ref && (
                <span className="font-mono text-xs text-slate-400">{product.internal_ref}</span>
              )}
              {product.category && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{product.category}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/stocks/products/${product.id}/edit`}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <Link
            href={`/stocks/adjust?product=${product.id}`}
            className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Adjust Stock
          </Link>
        </div>
      </div>

      {isLow && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 font-medium">
            Stock ({formatNumber(onHand)} {product.uom}) is at or below reorder point ({formatNumber(product.reorder_point)}).
            {product.reorder_qty > 0 && ` Suggested reorder: ${formatNumber(product.reorder_qty)} ${product.uom}.`}
          </span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Package,      label: "On Hand",       value: `${formatNumber(onHand)} ${product.uom}`, color: isLow ? "text-red-600" : "text-teal-600" },
          { icon: TrendingDown, label: "Cost Price",    value: formatCurrency(product.cost_price ?? 0),  color: "text-slate-700" },
          { icon: TrendingUp,   label: "Sales Price",   value: formatCurrency(product.sales_price ?? 0), color: "text-slate-700" },
          { icon: Package,      label: "Stock Value",   value: formatCurrency(stockValue),               color: "text-slate-900" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <p className="text-xs text-slate-500">{label}</p>
            </div>
            <p className={`text-base font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Product details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Product Details</h3>
          <div className="space-y-2.5">
            {[
              { label: "Unit of Measure", value: product.uom },
              { label: "Tax Rate",        value: product.tax_rate ? `${product.tax_rate}%` : "—" },
              { label: "Reorder Point",   value: product.reorder_point > 0 ? `${formatNumber(product.reorder_point)} ${product.uom}` : "—" },
              { label: "Reorder Qty",     value: product.reorder_qty > 0 ? `${formatNumber(product.reorder_qty)} ${product.uom}` : "—" },
              { label: "Added",           value: formatDate(product.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Stock Summary</h3>
          <div className="space-y-2.5">
            {[
              { label: "Total Received",  value: `${formatNumber(moves.filter((m: any) => m.to_location).reduce((s: number, m: any) => s + Number(m.quantity), 0))} ${product.uom}` },
              { label: "Total Dispatched", value: `${formatNumber(moves.filter((m: any) => m.from_location).reduce((s: number, m: any) => s + Number(m.quantity), 0))} ${product.uom}` },
              { label: "Net On Hand",     value: `${formatNumber(onHand)} ${product.uom}` },
              { label: "Move Count",      value: `${moves.length} transactions` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock moves */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Stock History</h3>
          <span className="text-xs text-slate-400">{moves.length} moves</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Date</th>
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Reference</th>
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Type</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Qty</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Unit Cost</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((m: any) => {
              const isIn = !!m.to_location
              return (
                <tr key={m.id} className="border-b border-slate-50">
                  <td className="px-5 py-3 text-slate-500">{formatDate(m.move_date)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{m.reference}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MOVE_TYPE_COLOR[m.source_type] ?? "bg-slate-100 text-slate-600"}`}>
                      {MOVE_TYPE_LABEL[m.source_type] ?? m.source_type}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${isIn ? "text-teal-600" : "text-red-600"}`}>
                    {isIn ? "+" : "−"}{formatNumber(m.quantity)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{m.unit_cost ? formatCurrency(m.unit_cost) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{m.total_cost ? formatCurrency(m.total_cost) : "—"}</td>
                </tr>
              )
            })}
            {moves.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No stock movements yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

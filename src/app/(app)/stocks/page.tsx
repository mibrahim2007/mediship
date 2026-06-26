import { requireTenantSession } from "@/lib/auth/session"
import { getProducts, getStockLevels } from "@/lib/db/inventory"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function StocksPage() {
  const session = await requireTenantSession()
  const [products, stockLevels] = await Promise.all([
    getProducts(session.companyId!),
    getStockLevels(session.companyId!),
  ])

  const lowStock = products.filter((p: any) => {
    const qty = stockLevels[p.id] ?? 0
    return p.reorder_point > 0 && qty <= p.reorder_point
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stocks/adjust">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-700">
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Adjust Stock
            </Button>
          </Link>
          <Link href="/stocks/products/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} at or below reorder point
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lowStock.slice(0, 3).map((p: any) => p.name).join(", ")}{lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ""}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">SKU / Name</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">UoM</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">On Hand</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Reorder At</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Cost</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Sales Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => {
              const onHand = stockLevels[p.id] ?? 0
              const isLow = p.reorder_point > 0 && onHand <= p.reorder_point
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/stocks/products/${p.id}`} className="group">
                      <p className="font-medium text-slate-800 group-hover:text-teal-700 transition-colors">{p.name}</p>
                      {p.internal_ref && (
                        <p className="text-xs font-mono text-slate-400">{p.internal_ref}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.category ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{p.uom}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${isLow ? "text-red-600" : "text-slate-900"}`}>
                      {isLow && <AlertTriangle className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                      {formatNumber(onHand)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500">
                    {p.reorder_point > 0 ? formatNumber(p.reorder_point) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(p.cost_price ?? 0)}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(p.sales_price ?? 0)}</td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                  <p className="text-base mb-1">No products yet</p>
                  <p className="text-xs">Add your first product to start tracking inventory</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

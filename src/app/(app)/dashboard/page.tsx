import { requireTenantSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getStockLevels } from "@/lib/db/inventory"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, DollarSign, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await requireTenantSession()
  const cid = session.companyId!

  const [soResult, poResult, productsResult, stockLevels] = await Promise.all([
    supabaseAdmin
      .from("sales_orders")
      .select("id, order_no, status, total")
      .eq("company_id", cid)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("purchase_orders")
      .select("id, order_no, status, total")
      .eq("company_id", cid)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("products")
      .select("id, reorder_point")
      .eq("company_id", cid)
      .eq("is_active", true),
    getStockLevels(cid),
  ])

  const orders = soResult.data ?? []
  const pos    = poResult.data ?? []
  const products = productsResult.data ?? []

  const salesRevenue = orders
    .filter((o: any) => o.status === "to_invoice" || o.status === "invoiced")
    .reduce((s: number, o: any) => s + Number(o.total ?? 0), 0)

  const pendingSO = orders.filter((o: any) =>
    o.status === "quotation" || o.status === "sales_order"
  ).length

  const draftPO = pos.filter((p: any) =>
    p.status === "rfq" || p.status === "rfq_sent"
  ).length

  const lowStock = products.filter((p: any) => {
    const onHand = stockLevels[p.id] ?? 0
    return p.reorder_point > 0 && onHand <= p.reorder_point
  }).length

  const kpis = [
    { label: "Sales Orders",    value: orders.length,                sub: `${pendingSO} open`,         icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Purchase Orders", value: pos.length,                   sub: `${draftPO} draft`,           icon: Package,      color: "bg-purple-50 text-purple-600" },
    { label: "Products",        value: products.length,              sub: `${lowStock} low stock`,      icon: TrendingUp,   color: "bg-orange-50 text-orange-600" },
    { label: "Revenue",         value: formatCurrency(salesRevenue), sub: "Invoiced + To Invoice",      icon: DollarSign,   color: "bg-green-50 text-green-600" },
  ]

  const STATUS_STYLE: Record<string, string> = {
    quotation:      "bg-slate-100 text-slate-600",
    sales_order:    "bg-blue-100 text-blue-700",
    to_invoice:     "bg-yellow-100 text-yellow-700",
    invoiced:       "bg-green-100 text-green-700",
    cancelled:      "bg-red-100 text-red-600",
    rfq:            "bg-slate-100 text-slate-600",
    rfq_sent:       "bg-blue-100 text-blue-700",
    purchase_order: "bg-indigo-100 text-indigo-700",
    done:           "bg-green-100 text-green-700",
  }

  const STATUS_LABEL: Record<string, string> = {
    quotation: "Quotation", sales_order: "Sales Order",
    to_invoice: "To Invoice", invoiced: "Invoiced", cancelled: "Cancelled",
    rfq: "RFQ", rfq_sent: "RFQ Sent",
    purchase_order: "Purchase Order", done: "Done",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {session.fullName ?? session.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No sales orders yet</p>
            ) : (
              <div className="space-y-1">
                {orders.slice(0, 6).map((o: any) => (
                  <Link key={o.id} href={`/sales/${o.id}`} className="flex justify-between items-center text-sm hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
                    <span className="text-teal-700 font-mono text-xs font-medium">{o.order_no}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="text-slate-900 font-medium">{formatCurrency(Number(o.total) ?? 0)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {pos.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No purchase orders yet</p>
            ) : (
              <div className="space-y-1">
                {pos.slice(0, 6).map((p: any) => (
                  <Link key={p.id} href={`/purchase/${p.id}`} className="flex justify-between items-center text-sm hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
                    <span className="text-teal-700 font-mono text-xs font-medium">{p.order_no}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                    <span className="text-slate-900 font-medium">{formatCurrency(Number(p.total) ?? 0)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

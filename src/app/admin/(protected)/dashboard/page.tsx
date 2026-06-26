import { getAllCompanies } from "@/lib/db/companies"
import { getAllSubscriptions } from "@/lib/db/subscriptions"
import { Building2, TrendingUp, Users, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [companies, subscriptions] = await Promise.all([
    getAllCompanies(),
    getAllSubscriptions(),
  ])

  const active = subscriptions.filter((s: any) => s.status === "active")
  const trialing = subscriptions.filter((s: any) => s.status === "trialing")
  const pastDue = subscriptions.filter((s: any) => s.status === "past_due")

  const mrr = active.reduce((sum: number, s: any) => {
    const price = s.billing_cycle === "yearly"
      ? (s.plans?.price_yearly ?? 0) / 12
      : (s.plans?.price_monthly ?? 0)
    return sum + price
  }, 0)

  const kpis = [
    { label: "Total Companies", value: companies.length, icon: Building2, color: "text-blue-400" },
    { label: "Active Subscriptions", value: active.length, icon: CreditCard, color: "text-green-400" },
    { label: "Trialing", value: trialing.length, icon: Users, color: "text-yellow-400" },
    { label: "MRR", value: formatCurrency(mrr), icon: TrendingUp, color: "text-teal-400" },
  ]

  const statusColor: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    trialing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    expired: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all tenants and subscriptions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg bg-slate-700 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.slice(0, 8).map((c: any) => {
                const sub = c.subscriptions?.[0]
                return (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">{sub?.plans?.display_name ?? "No plan"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColor[sub?.status ?? ""] ?? "text-slate-400"}`}>
                      {sub?.status ?? "—"}
                    </span>
                  </div>
                )
              })}
              {companies.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No companies yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Subscription Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Active", count: active.length, cls: statusColor.active },
                { label: "Trialing", count: trialing.length, cls: statusColor.trialing },
                { label: "Past Due", count: pastDue.length, cls: statusColor.past_due },
                { label: "Cancelled", count: subscriptions.filter((s: any) => s.status === "cancelled").length, cls: statusColor.cancelled },
              ].map(({ label, count, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cls}`}>{label}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

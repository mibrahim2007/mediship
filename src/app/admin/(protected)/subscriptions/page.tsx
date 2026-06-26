import { getAllSubscriptions } from "@/lib/db/subscriptions"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

const statusColor: Record<string, string> = {
  active:    "bg-green-500/20 text-green-400 border-green-500/30",
  trialing:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  past_due:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  expired:   "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

export default async function AdminSubscriptionsPage() {
  const subs = await getAllSubscriptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-slate-400 text-sm mt-1">{subs.length} total subscriptions</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Company</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Billing</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Renews</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">MRR</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s: any) => {
                const mrr = s.billing_cycle === "yearly"
                  ? (s.plans?.price_yearly ?? 0) / 12
                  : (s.plans?.price_monthly ?? 0)
                return (
                  <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{s.companies?.name}</p>
                      <p className="text-slate-400 text-xs">{s.companies?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{s.plans?.display_name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColor[s.status] ?? "text-slate-400"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 capitalize">{s.billing_cycle}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {s.current_period_end ? formatDate(s.current_period_end) : s.trial_ends_at ? `Trial ends ${formatDate(s.trial_ends_at)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-teal-400 font-medium">{s.status === "active" ? formatCurrency(mrr) : "—"}</td>
                  </tr>
                )
              })}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">No subscriptions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

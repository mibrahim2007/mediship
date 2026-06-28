import { requireTenantSession } from "@/lib/auth/session"
import { getTeamSalesComparison, getTeams } from "@/lib/db/teams"
import { TeamComparisonCharts } from "@/components/app/team-comparison-charts"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TeamComparisonPage() {
  const session = await requireTenantSession()
  const [{ teamStats, areaStats }, teams] = await Promise.all([
    getTeamSalesComparison(session.companyId!),
    getTeams(session.companyId!),
  ])

  const topTeam = [...teamStats].sort((a, b) => b.sales - a.sales)[0]
  const topArea = [...areaStats].sort((a, b) => b.sales - a.sales)[0]
  const totalSales = teamStats.reduce((s, t) => s + t.sales, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales/teams" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Comparison</h1>
          <p className="text-slate-500 text-sm mt-0.5">Area-wise and team-wise performance analytics</p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No teams found</p>
          <p className="text-slate-400 text-sm mt-1">
            <Link href="/sales/teams/new" className="text-teal-600 hover:underline">Create a team</Link> to start tracking performance
          </p>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Teams",          value: String(teams.length) },
              { label: "Total Sales",    value: `PKR ${totalSales.toLocaleString()}` },
              { label: "Top Team",       value: topTeam?.name ?? "—" },
              { label: "Top Area",       value: topArea?.name ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>

          <TeamComparisonCharts teamStats={teamStats as any} areaStats={areaStats as any} />
        </>
      )}
    </div>
  )
}

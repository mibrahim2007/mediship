import { requireTenantSession } from "@/lib/auth/session"
import { getTeams } from "@/lib/db/teams"
import { Button } from "@/components/ui/button"
import { Plus, Users, MapPin, BarChart2, Target } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function TeamsPage() {
  const session = await requireTenantSession()
  const teams = await getTeams(session.companyId!)

  const totalTeams = teams.length
  const totalMembers = teams.reduce((s: number, t: any) => s + (t.sale_team_members?.length ?? 0), 0)
  const totalTarget = teams.reduce((s: number, t: any) => s + Number(t.target_amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sale Distribution Teams</h1>
          <p className="text-slate-500 text-sm mt-1">Manage teams, assign medicines, and track area-wise performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/teams/comparison">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
              <BarChart2 className="h-4 w-4 mr-1.5" /> Comparison
            </Button>
          </Link>
          <Link href="/sales/teams/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" /> New Team
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Teams",   value: totalTeams,              icon: Users,  color: "bg-teal-50 text-teal-600" },
          { label: "Total Members", value: totalMembers,            icon: Users,  color: "bg-blue-50 text-blue-600" },
          { label: "Combined Target", value: formatCurrency(totalTarget), icon: Target, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No teams yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first sale distribution team</p>
          <Link href="/sales/teams/new" className="inline-block mt-4">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" /> Create Team
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((t: any) => {
            const memberCount = t.sale_team_members?.length ?? 0
            return (
              <Link key={t.id} href={`/sales/teams/${t.id}`} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {t.name}
                      </h3>
                      {t.sale_areas && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {t.sale_areas.name}{t.sale_areas.city ? ` · ${t.sale_areas.city}` : ""}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {t.sale_team_members?.slice(0, 4).map((m: any) => (
                      <div key={m.id} className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold border-2 border-white">
                        {(m.users?.full_name ?? "?")[0]?.toUpperCase()}
                      </div>
                    ))}
                    {Array.from({ length: 4 - memberCount }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-dashed border-slate-200" />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">{memberCount}/4</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>Target: <span className="font-medium text-slate-700">{formatCurrency(Number(t.target_amount ?? 0))}</span></span>
                    {t.users && <span>Lead: <span className="font-medium text-slate-700">{t.users.full_name}</span></span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

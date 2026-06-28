import { requireTenantSession } from "@/lib/auth/session"
import { getAllAreas } from "@/lib/db/teams"
import { AreasClient } from "@/components/app/areas-client"
import Link from "next/link"
import { ArrowLeft, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AreasPage() {
  const session = await requireTenantSession()
  const areas = await getAllAreas(session.companyId!)

  const totalAreas  = areas.length
  const citiesCount = new Set(areas.map((a: any) => a.city).filter(Boolean)).size
  const teamsLinked = areas.reduce((s: number, a: any) => s + (a.sale_teams?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/teams" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Distribution Areas</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Define geographic areas for your sale distribution teams
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Areas",   value: totalAreas },
          { label: "Cities",        value: citiesCount },
          { label: "Teams Linked",  value: teamsLinked },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive area list */}
      <AreasClient initialAreas={areas as any} />
    </div>
  )
}

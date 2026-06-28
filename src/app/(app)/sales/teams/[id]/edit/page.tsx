import { requireTenantSession } from "@/lib/auth/session"
import { getTeamById, getAreas, getSalesReps } from "@/lib/db/teams"
import { TeamForm } from "@/components/app/team-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const [team, areas, salesReps] = await Promise.all([
    getTeamById(params.id, session.companyId!),
    getAreas(session.companyId!),
    getSalesReps(session.companyId!),
  ])

  if (!team) notFound()
  const t = team as any

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/sales/teams/${params.id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Team</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.name}</p>
        </div>
      </div>
      <TeamForm
        areas={areas as any}
        salesReps={salesReps as any}
        editId={params.id}
        defaultValues={{
          name:          t.name,
          area_id:       t.area_id ?? "",
          team_lead_id:  t.team_lead_id ?? "",
          target_amount: Number(t.target_amount ?? 0),
          notes:         t.notes ?? "",
        }}
      />
    </div>
  )
}

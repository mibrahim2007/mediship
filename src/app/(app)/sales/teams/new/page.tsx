import { requireTenantSession } from "@/lib/auth/session"
import { getAreas, getSalesReps } from "@/lib/db/teams"
import { TeamForm } from "@/components/app/team-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewTeamPage() {
  const session = await requireTenantSession()
  const [areas, salesReps] = await Promise.all([
    getAreas(session.companyId!),
    getSalesReps(session.companyId!),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales/teams" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Sale Team</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create an area-based distribution team</p>
        </div>
      </div>
      <TeamForm areas={areas as any} salesReps={salesReps as any} />
    </div>
  )
}

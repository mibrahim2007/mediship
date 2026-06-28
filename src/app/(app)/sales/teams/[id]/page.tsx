import { requireTenantSession } from "@/lib/auth/session"
import { getTeamById, getSalesReps } from "@/lib/db/teams"
import { getProducts } from "@/lib/db/sales"
import { TeamDetailClient } from "@/components/app/team-detail-client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, MapPin, Target, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { deleteTeamAction } from "@/lib/actions/teams"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const [team, salesReps, allProducts] = await Promise.all([
    getTeamById(params.id, session.companyId!),
    getSalesReps(session.companyId!),
    getProducts(session.companyId!),
  ])

  if (!team) notFound()

  async function handleDelete() {
    "use server"
    const s = await requireTenantSession()
    await deleteTeamAction(params.id)
    redirect("/sales/teams")
  }

  const t = team as any
  const memberCount = t.sale_team_members?.length ?? 0
  const productCount = t.sale_team_products?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales/teams" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.name}</h1>
            <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-400">
              {t.sale_areas && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {t.sale_areas.name}{t.sale_areas.city ? ` · ${t.sale_areas.city}` : ""}
                </span>
              )}
              <span>{memberCount}/4 members</span>
              <span>{productCount} medicines</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/sales/teams/${params.id}/edit`}>
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
              <Edit className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </Link>
          <form action={handleDelete}>
            <Button size="sm" variant="outline" type="submit" className="border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Team Lead",    value: t.users?.full_name ?? "—" },
          { label: "Area",         value: t.sale_areas ? `${t.sale_areas.name}${t.sale_areas.region ? ` · ${t.sale_areas.region}` : ""}` : "—" },
          { label: "Monthly Target", value: formatCurrency(Number(t.target_amount ?? 0)) },
          { label: "Status",       value: t.is_active ? "Active" : "Inactive" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {t.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800">
          {t.notes}
        </div>
      )}

      {/* Members + Products (client) */}
      <TeamDetailClient
        teamId={params.id}
        members={t.sale_team_members ?? []}
        products={t.sale_team_products ?? []}
        allReps={salesReps as any}
        allProducts={allProducts as any}
      />
    </div>
  )
}

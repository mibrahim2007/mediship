import Link from "next/link"
import { getAllPlans } from "@/lib/db/plans"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminPlansPage() {
  const plans = await getAllPlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-slate-400 text-sm mt-1">Manage subscription tiers</p>
        </div>
        <Link href="/admin/plans/new">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-500">
            <Plus className="h-4 w-4 mr-2" /> New Plan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((p: any) => (
          <Card key={p.id} className={`bg-slate-800 border-slate-700 ${!p.is_active ? "opacity-50" : ""}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{p.display_name}</h3>
                {!p.is_active && (
                  <span className="text-xs text-slate-500 border border-slate-600 px-1.5 py-0.5 rounded">Inactive</span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-400">{formatCurrency(p.price_monthly)}</p>
                <p className="text-xs text-slate-400">/ month</p>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p>Users: {p.max_users === 0 ? "Unlimited" : p.max_users}</p>
                <p>Warehouses: {p.max_warehouses === 0 ? "Unlimited" : p.max_warehouses}</p>
                <p>Products: {p.max_products === 0 ? "Unlimited" : p.max_products}</p>
              </div>
              <div className="space-y-1">
                {Object.entries(p.features ?? {}).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="inline-block text-xs bg-teal-600/20 text-teal-400 border border-teal-600/30 px-1.5 py-0.5 rounded mr-1 mb-1">
                    {k.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
              <Link href={`/admin/plans/${p.id}`}>
                <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Pencil className="h-3 w-3 mr-2" /> Edit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

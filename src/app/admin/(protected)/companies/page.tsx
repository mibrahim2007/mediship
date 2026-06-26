import Link from "next/link"
import { getAllCompanies } from "@/lib/db/companies"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const statusColor: Record<string, string> = {
  active:    "bg-green-500/20 text-green-400 border-green-500/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default async function AdminCompaniesPage() {
  const companies = await getAllCompanies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">{companies.length} tenants registered</p>
        </div>
        <Link href="/admin/companies/new">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-500">
            <Plus className="h-4 w-4 mr-2" /> Onboard Company
          </Button>
        </Link>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Company</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any) => {
                const sub = c.subscriptions?.[0]
                return (
                  <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{c.name}</p>
                      <p className="text-slate-400 text-xs">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{sub?.plans?.display_name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColor[c.status] ?? "text-slate-400"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/companies/${c.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No companies yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

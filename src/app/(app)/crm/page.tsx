import { requireTenantSession } from "@/lib/auth/session"
import { getLeads } from "@/lib/db/crm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STAGE_STYLE: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700",
  qualified:   "bg-indigo-100 text-indigo-700",
  proposal:    "bg-yellow-100 text-yellow-700",
  negotiation: "bg-orange-100 text-orange-700",
  won:         "bg-green-100 text-green-700",
  lost:        "bg-red-100 text-red-700",
}

const PRIORITY_DOT: Record<string, string> = {
  low:    "bg-slate-300",
  normal: "bg-blue-400",
  high:   "bg-red-500",
}

const STAGE_LABEL: Record<string, string> = {
  new: "New", qualified: "Qualified",
  proposal: "Proposal", negotiation: "Negotiation", won: "Won", lost: "Lost",
}

export default async function CrmPage() {
  const session = await requireTenantSession()
  const leads = await getLeads(session.companyId!)

  const pipeline = leads.filter((l: any) => !["won", "lost"].includes(l.stage))
  const pipelineValue = pipeline.reduce((s: number, l: any) => s + Number(l.expected_revenue ?? 0), 0)
  const wonCount = leads.filter((l: any) => l.stage === "won").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM</h1>
          <p className="text-slate-500 text-sm mt-1">{leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/contacts">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
              <Users className="h-4 w-4 mr-2" /> Contacts
            </Button>
          </Link>
          <Link href="/crm/leads/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> New Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Pipeline", value: formatCurrency(pipelineValue) },
          { label: "Open Leads",      value: String(pipeline.length) },
          { label: "Won",             value: String(wonCount) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-lg font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Lead</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Contact</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Stage</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Close By</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Revenue</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Prob.</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l: any) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/crm/leads/${l.id}`} className="font-medium text-slate-900 hover:text-teal-700 flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[l.priority] ?? "bg-slate-300"}`} />
                      {l.name}
                    </Link>
                    {l.company_name && <p className="text-xs text-slate-400 ml-4">{l.company_name}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{(l as any).contacts?.name ?? l.contact_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${STAGE_STYLE[l.stage] ?? "bg-slate-100 text-slate-500"}`}>
                      {STAGE_LABEL[l.stage] ?? l.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{l.expected_closing ? formatDate(l.expected_closing) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{l.expected_revenue ? formatCurrency(l.expected_revenue) : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{l.probability != null ? `${l.probability}%` : "—"}</td>
                </tr>
              ))}
              {!leads.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No leads yet — create your first lead</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

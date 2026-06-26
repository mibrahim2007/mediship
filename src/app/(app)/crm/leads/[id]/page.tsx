import { requireTenantSession } from "@/lib/auth/session"
import { getLeadById } from "@/lib/db/crm"
import { LeadStageActions } from "@/components/app/lead-stage-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Phone, Mail, Building2 } from "lucide-react"
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

const STAGE_LABEL: Record<string, string> = {
  new: "New", qualified: "Qualified",
  proposal: "Proposal", negotiation: "Negotiation", won: "Won", lost: "Lost",
}

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-600",
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const lead = await getLeadById(params.id, session.companyId!)
  if (!lead) notFound()

  const contact = (lead as any).contacts

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/crm" className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${STAGE_STYLE[lead.stage] ?? "bg-slate-100 text-slate-500"}`}>
                {STAGE_LABEL[lead.stage] ?? lead.stage}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${PRIORITY_STYLE[lead.priority ?? "normal"]}`}>
                {lead.priority} priority
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {lead.lead_type?.toUpperCase()} {lead.source ? `· ${lead.source}` : ""}
              {lead.sales_team ? ` · ${lead.sales_team}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LeadStageActions leadId={lead.id} currentStage={lead.stage} />
          <Link
            href={`/crm/leads/${lead.id}/edit`}
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Expected Revenue", value: lead.expected_revenue ? formatCurrency(lead.expected_revenue) : "—" },
          { label: "Probability",      value: lead.probability != null ? `${lead.probability}%` : "—" },
          { label: "Expected Close",   value: lead.expected_closing ? formatDate(lead.expected_closing) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-base font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact</h3>
          {contact ? (
            <div className="space-y-2">
              <Link href={`/crm/contacts/${contact.id}`} className="font-medium text-teal-700 hover:underline text-sm">
                {contact.name}
              </Link>
              {contact.company_name && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {contact.company_name}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {contact.phone}
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {contact.email}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {lead.contact_name && <p className="font-medium text-slate-800">{lead.contact_name}</p>}
              {lead.company_name && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {lead.company_name}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {lead.email}
                </div>
              )}
              {!lead.contact_name && !lead.phone && !lead.email && (
                <p className="text-slate-400">No contact info</p>
              )}
            </div>
          )}
        </div>

        {/* Lead details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Details</h3>
          <div className="space-y-2.5">
            {[
              { label: "Created",   value: formatDate(lead.created_at) },
              { label: "Source",    value: lead.source ?? "—" },
              { label: "Team",      value: lead.sales_team ?? "—" },
              { label: "Lost Reason", value: lead.lost_reason ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}
    </div>
  )
}

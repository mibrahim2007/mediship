import { requireTenantSession } from "@/lib/auth/session"
import { getLeadById, getContactsForSelect } from "@/lib/db/crm"
import { LeadForm } from "@/components/app/lead-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const [lead, contacts] = await Promise.all([
    getLeadById(params.id, session.companyId!),
    getContactsForSelect(session.companyId!),
  ])
  if (!lead) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/crm/leads/${params.id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Lead</h1>
          <p className="text-slate-500 text-sm mt-0.5">{lead.name}</p>
        </div>
      </div>
      <LeadForm
        contacts={contacts as any}
        editId={lead.id}
        defaultValues={{
          name: lead.name,
          lead_type: lead.lead_type as any,
          stage: lead.stage as any,
          contact_id: lead.contact_id ?? "",
          company_name: lead.company_name ?? "",
          contact_name: lead.contact_name ?? "",
          phone: lead.phone ?? "",
          email: lead.email ?? "",
          expected_revenue: Number(lead.expected_revenue ?? 0),
          probability: Number(lead.probability ?? 0),
          expected_closing: lead.expected_closing ?? "",
          priority: lead.priority as any,
          source: lead.source ?? "",
          sales_team: lead.sales_team ?? "",
          notes: lead.notes ?? "",
        }}
      />
    </div>
  )
}

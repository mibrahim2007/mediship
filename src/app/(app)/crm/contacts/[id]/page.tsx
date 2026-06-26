import { requireTenantSession } from "@/lib/auth/session"
import { getContactById } from "@/lib/db/crm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Building2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const TYPE_STYLE: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  vendor:   "bg-amber-100 text-amber-700",
  both:     "bg-purple-100 text-purple-700",
}

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const contact = await getContactById(params.id, session.companyId!)
  if (!contact) notFound()

  const fullAddress = [contact.address, contact.city, contact.country].filter(Boolean).join(", ")

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/crm/contacts" className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{contact.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${TYPE_STYLE[contact.type] ?? "bg-slate-100 text-slate-500"}`}>
                {contact.type}
              </span>
              {!contact.is_active && (
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-500">Inactive</span>
              )}
            </div>
            {contact.company_name && (
              <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {contact.company_name}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/crm/contacts/${contact.id}/edit`}
          className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Contact Info</h3>
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" /> {contact.phone}
            </div>
          )}
          {contact.mobile && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" /> {contact.mobile} <span className="text-xs text-slate-400">(mobile)</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" /> {contact.email}
            </div>
          )}
          {fullAddress && (
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> {fullAddress}
            </div>
          )}
          {!contact.phone && !contact.email && !fullAddress && (
            <p className="text-sm text-slate-400">No contact info</p>
          )}
        </div>

        {/* Financial */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Financial</h3>
          <div className="space-y-2.5">
            {[
              { label: "Tax Reg. No.",   value: contact.tax_reg_no ?? "—" },
              { label: "Credit Limit",   value: contact.credit_limit ? formatCurrency(contact.credit_limit) : "—" },
              { label: "Payment Terms",  value: contact.payment_terms ?? "—" },
              { label: "Added",          value: formatDate(contact.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

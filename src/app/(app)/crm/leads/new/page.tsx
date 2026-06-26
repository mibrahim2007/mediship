import { requireTenantSession } from "@/lib/auth/session"
import { getContactsForSelect } from "@/lib/db/crm"
import { LeadForm } from "@/components/app/lead-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewLeadPage() {
  const session = await requireTenantSession()
  const contacts = await getContactsForSelect(session.companyId!)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/crm" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Lead</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track a new sales opportunity</p>
        </div>
      </div>
      <LeadForm contacts={contacts as any} />
    </div>
  )
}

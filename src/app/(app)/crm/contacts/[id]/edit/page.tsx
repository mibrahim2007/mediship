import { requireTenantSession } from "@/lib/auth/session"
import { getContactById } from "@/lib/db/crm"
import { ContactForm } from "@/components/app/contact-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const contact = await getContactById(params.id, session.companyId!)
  if (!contact) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/crm/contacts/${params.id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Contact</h1>
          <p className="text-slate-500 text-sm mt-0.5">{contact.name}</p>
        </div>
      </div>
      <ContactForm
        editId={contact.id}
        defaultValues={{
          name:          contact.name,
          type:          contact.type as any,
          company_name:  contact.company_name ?? "",
          email:         contact.email ?? "",
          phone:         contact.phone ?? "",
          mobile:        contact.mobile ?? "",
          address:       contact.address ?? "",
          city:          contact.city ?? "",
          country:       contact.country ?? "Pakistan",
          tax_reg_no:    contact.tax_reg_no ?? "",
          credit_limit:  Number(contact.credit_limit ?? 0),
          payment_terms: contact.payment_terms ?? "",
        }}
      />
    </div>
  )
}

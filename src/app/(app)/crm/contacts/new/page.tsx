import { ContactForm } from "@/components/app/contact-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function NewContactPage({ searchParams }: Props) {
  const params = await searchParams
  const type = (params.type === "vendor" || params.type === "customer" || params.type === "both")
    ? params.type
    : undefined

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/crm/contacts" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Contact</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {type === "vendor" ? "Create a new vendor" : type === "customer" ? "Create a new customer" : "Create a customer, vendor, or both"}
          </p>
        </div>
      </div>
      <ContactForm defaultValues={type ? { type } : undefined} />
    </div>
  )
}

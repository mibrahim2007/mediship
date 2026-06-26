import { listPlans } from "@/lib/db/plans"
import { OnboardCompanyForm } from "@/components/admin/onboard-company-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewCompanyPage() {
  const plans = await listPlans()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/companies" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Onboard Company</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create a new tenant and assign a plan</p>
        </div>
      </div>

      <OnboardCompanyForm plans={plans} />
    </div>
  )
}

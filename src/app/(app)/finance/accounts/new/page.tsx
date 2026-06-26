import { requireTenantSession } from "@/lib/auth/session"
import { getAccounts } from "@/lib/db/finance"
import { AccountForm } from "@/components/app/account-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NewAccountPage() {
  const session = await requireTenantSession()
  const accounts = await getAccounts(session.companyId!)

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/finance/accounts" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Account</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add an account to the Chart of Accounts</p>
        </div>
      </div>

      <AccountForm parentAccounts={accounts} />
    </div>
  )
}

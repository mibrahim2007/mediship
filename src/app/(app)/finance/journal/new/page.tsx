import { requireTenantSession } from "@/lib/auth/session"
import { getAccounts } from "@/lib/db/finance"
import { JournalEntryForm } from "@/components/app/journal-entry-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NewJournalEntryPage() {
  const session = await requireTenantSession()
  const accounts = await getAccounts(session.companyId!)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/finance" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Journal Entry</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a double-entry journal voucher</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 font-medium">No accounts found.</p>
          <p className="text-amber-600 text-sm mt-1">
            Set up your Chart of Accounts first before creating journal entries.
          </p>
          <Link href="/finance/accounts" className="mt-3 inline-block text-teal-600 hover:underline text-sm font-medium">
            Go to Chart of Accounts
          </Link>
        </div>
      ) : (
        <JournalEntryForm accounts={accounts} />
      )}
    </div>
  )
}

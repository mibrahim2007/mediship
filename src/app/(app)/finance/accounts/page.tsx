import { requireTenantSession } from "@/lib/auth/session"
import { getAccounts } from "@/lib/db/finance"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const TYPE_STYLE: Record<string, string> = {
  asset:     "bg-blue-100 text-blue-700",
  liability: "bg-red-100 text-red-600",
  equity:    "bg-purple-100 text-purple-700",
  revenue:   "bg-green-100 text-green-700",
  expense:   "bg-orange-100 text-orange-700",
}

export default async function AccountsPage() {
  const session = await requireTenantSession()
  const accounts = await getAccounts(session.companyId!)

  const byType = accounts.reduce((acc: Record<string, any[]>, a: any) => {
    const t = a.account_type ?? "other"
    if (!acc[t]) acc[t] = []
    acc[t].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/finance" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chart of Accounts</h1>
            <p className="text-slate-500 text-sm mt-1">{accounts.length} accounts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/accounts/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> Add Account
            </Button>
          </Link>
          <Link href="/finance/journal/new">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">New Journal Entry</Button>
          </Link>
        </div>
      </div>

      {Object.entries(byType).map(([type, accs]) => (
        <div key={type}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 px-1 capitalize">{type}</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-slate-500 font-medium w-24">Code</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">Name</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(accs as any[]).map((a: any) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{a.code}</td>
                      <td className="px-5 py-3 text-slate-800 font-medium">{a.name}</td>
                      <td className="px-5 py-3">
                        <span className={"text-xs px-2 py-0.5 rounded capitalize " + (TYPE_STYLE[a.account_type] ?? "bg-slate-100 text-slate-600")}>
                          {a.account_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ))}

      {accounts.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-slate-400">
            No accounts configured yet. Contact your administrator to set up the Chart of Accounts.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

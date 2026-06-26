import { requireTenantSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-slate-100 text-slate-600",
  posted:    "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
}

export default async function FinancePage() {
  const session = await requireTenantSession()
  const { data: entries } = await supabaseAdmin
    .from("journal_entries")
    .select("*")
    .eq("company_id", session.companyId!)
    .order("entry_date", { ascending: false })
    .limit(50)

  const totalPosted = (entries ?? [])
    .filter((e: any) => e.status === "posted")
    .reduce((s: number, e: any) => s + Number(e.total_debit ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance — Journal Entries</h1>
          <p className="text-slate-500 text-sm mt-1">{entries?.length ?? 0} entries · {formatCurrency(totalPosted)} total posted</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/accounts">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
              <BookOpen className="h-4 w-4 mr-2" /> Chart of Accounts
            </Button>
          </Link>
          <Link href="/finance/journal/new">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Entry No.</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Type</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Narration</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium">Total Dr.</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((e: any) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <Link href={"/finance/journal/" + e.id} className="font-mono text-xs text-teal-700 hover:underline">
                      {e.entry_no}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(e.entry_date)}</td>
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">{e.voucher_type}</td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{e.narration ?? e.reference ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={"text-xs px-2 py-0.5 rounded capitalize " + (STATUS_STYLE[e.status] ?? "bg-slate-100 text-slate-600")}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(e.total_debit ?? 0)}</td>
                </tr>
              ))}
              {!entries?.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No journal entries yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

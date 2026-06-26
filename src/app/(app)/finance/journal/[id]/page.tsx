import { requireTenantSession } from "@/lib/auth/session"
import { getJournalEntryById } from "@/lib/db/finance"
import { JournalEntryActions } from "@/components/app/journal-entry-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_STYLE: Record<string, string> = {
  draft:     "bg-slate-100 text-slate-600",
  posted:    "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
}

export default async function JournalEntryDetailPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const entry = await getJournalEntryById(params.id, session.companyId!)
  if (!entry) notFound()

  const lines = (entry as any).lines ?? []
  const totalDebit  = lines.reduce((s: number, l: any) => s + Number(l.debit  ?? 0), 0)
  const totalCredit = lines.reduce((s: number, l: any) => s + Number(l.credit ?? 0), 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/finance" className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{entry.entry_no}</h1>
              <span className={"text-xs px-2 py-0.5 rounded font-medium capitalize " + (STATUS_STYLE[entry.status] ?? "bg-slate-100 text-slate-600")}>
                {entry.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {formatDate(entry.entry_date)} · {entry.voucher_type} · {entry.journal_type}
            </p>
          </div>
        </div>
        <JournalEntryActions entryId={entry.id} status={entry.status} />
      </div>

      {entry.narration && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
          {entry.narration}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Debit",  value: formatCurrency(totalDebit) },
          { label: "Total Credit", value: formatCurrency(totalCredit) },
          { label: "Reference",    value: entry.reference ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-base font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">Journal Lines</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Account</th>
              <th className="text-left px-5 py-2 text-slate-500 font-medium">Description</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium w-28">Debit</th>
              <th className="text-right px-5 py-2 text-slate-500 font-medium w-28">Credit</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l: any, i: number) => (
              <tr key={l.id ?? i} className="border-b border-slate-50">
                <td className="px-5 py-3">
                  <span className="font-mono text-xs text-slate-500">[{l.accounts?.code}]</span>{" "}
                  <span className="text-slate-800">{l.accounts?.name}</span>
                </td>
                <td className="px-5 py-3 text-slate-500">{l.description ?? "—"}</td>
                <td className="px-5 py-3 text-right text-slate-800">{l.debit > 0 ? formatCurrency(l.debit) : "—"}</td>
                <td className="px-5 py-3 text-right text-slate-800">{l.credit > 0 ? formatCurrency(l.credit) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={2} className="px-5 py-2.5 text-xs font-semibold text-slate-600">Total</td>
              <td className="px-5 py-2.5 text-right font-bold text-slate-900">{formatCurrency(totalDebit)}</td>
              <td className="px-5 py-2.5 text-right font-bold text-slate-900">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

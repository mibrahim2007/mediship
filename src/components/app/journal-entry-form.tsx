"use client"

import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { journalEntrySchema, type JournalEntryInput } from "@/lib/validations/finance"
import { createJournalEntryAction } from "@/lib/actions/finance"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency } from "@/lib/utils"

interface Account { id: string; code: string; name: string; account_type: string }
interface Props { accounts: Account[] }

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

const JOURNAL_TYPES = [
  { value: "general",  label: "General" },
  { value: "cash",     label: "Cash" },
  { value: "bank",     label: "Bank" },
  { value: "sale",     label: "Sale" },
  { value: "purchase", label: "Purchase" },
]

const VOUCHER_TYPES = [
  { value: "JV",   label: "JV - Journal Voucher" },
  { value: "CPV",  label: "CPV - Cash Payment" },
  { value: "CRV",  label: "CRV - Cash Receipt" },
  { value: "BPV",  label: "BPV - Bank Payment" },
  { value: "BRV",  label: "BRV - Bank Receipt" },
  { value: "INV",  label: "INV - Invoice" },
  { value: "BILL", label: "BILL - Vendor Bill" },
]

export function JournalEntryForm({ accounts }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<JournalEntryInput>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      entry_date:   today,
      journal_type: "general",
      voucher_type: "JV",
      lines: [
        { account_id: "", debit: 0, credit: 0, sort_order: 0 },
        { account_id: "", debit: 0, credit: 0, sort_order: 1 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" })
  const lines = useWatch({ control: form.control, name: "lines" })
  const { formState: { errors, isSubmitting } } = form

  const totalDebit  = (lines ?? []).reduce((s, l) => s + Number(l.debit  ?? 0), 0)
  const totalCredit = (lines ?? []).reduce((s, l) => s + Number(l.credit ?? 0), 0)
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01

  async function onSubmit(data: JournalEntryInput) {
    try {
      const entry = await createJournalEntryAction(data)
      toast.success(`Journal entry ${entry.entry_no} created`)
      router.push(`/finance/journal/${entry.id}`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create entry")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Entry Details</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Entry Date <span className="text-red-500">*</span></Label>
            <Input type="date" className="border-slate-200" {...form.register("entry_date")} />
            {errors.entry_date && <p className="text-xs text-red-500 mt-1">{errors.entry_date.message}</p>}
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Journal Type</Label>
            <select className={sel} {...form.register("journal_type")}>
              {JOURNAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Voucher Type</Label>
            <select className={sel} {...form.register("voucher_type")}>
              {VOUCHER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Reference</Label>
            <Input className="border-slate-200" placeholder="e.g. INV-001" {...form.register("reference")} />
          </div>
          <div className="col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Narration</Label>
            <Input className="border-slate-200" placeholder="Description of this entry..." {...form.register("narration")} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Journal Lines</h3>
          <a href="/finance/accounts/new" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
            <Plus className="h-3 w-3" /> New Account
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-64">Account</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Description</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-28">Debit (Dr.)</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-28">Credit (Cr.)</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={field.id} className="border-b border-slate-50">
                  <td className="px-2 py-2">
                    <select className={cn(sel, "text-xs")} {...(form.register as any)(`lines.${i}.account_id`)}>
                      <option value="">Select account...</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>[{a.code}] {a.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <Input className="border-slate-200 h-8 text-xs" placeholder="Line description" {...(form.register as any)(`lines.${i}.description`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" step="0.01" min="0" className="border-slate-200 h-8 text-xs text-right" {...(form.register as any)(`lines.${i}.debit`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" step="0.01" min="0" className="border-slate-200 h-8 text-xs text-right" {...(form.register as any)(`lines.${i}.credit`)} />
                  </td>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => remove(i)} disabled={fields.length <= 2} className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-100">
              <tr>
                <td colSpan={2} className="px-3 py-2 text-xs text-slate-500 font-medium">Totals</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(totalDebit)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(totalCredit)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => append({ account_id: "", debit: 0, credit: 0, sort_order: fields.length })}
            className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Line
          </button>
          {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
            <p className="text-xs text-amber-600 font-medium">
              Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
            </p>
          )}
          {isBalanced && totalDebit > 0 && (
            <p className="text-xs text-green-600 font-medium">Balanced</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/finance")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isBalanced} className="bg-teal-600 hover:bg-teal-700 min-w-40">
          {isSubmitting ? "Saving..." : "Save Draft Entry"}
        </Button>
      </div>
    </form>
  )
}

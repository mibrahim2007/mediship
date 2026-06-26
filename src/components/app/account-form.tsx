"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { accountSchema, type AccountInput } from "@/lib/validations/finance"
import { createAccountAction } from "@/lib/actions/finance"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

const ACCOUNT_TYPES = [
  { value: "asset",     label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity",    label: "Equity" },
  { value: "revenue",   label: "Revenue" },
  { value: "expense",   label: "Expense" },
]

interface Props {
  parentAccounts?: Array<{ id: string; code: string; name: string; account_type: string }>
}

export function AccountForm({ parentAccounts = [] }: Props) {
  const router = useRouter()

  const form = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: { code: "", name: "", account_type: "asset", parent_id: "" },
  })

  const { formState: { errors, isSubmitting } } = form

  async function onSubmit(data: AccountInput) {
    try {
      const account = await createAccountAction(data)
      toast.success(`Account ${account.code} — ${account.name} created`)
      router.push("/finance/accounts")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create account")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Account Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Account Code <span className="text-red-500">*</span></Label>
            <Input
              className="border-slate-200 font-mono"
              placeholder="e.g. 1001"
              {...form.register("code")}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Account Type <span className="text-red-500">*</span></Label>
            <select className={sel} {...form.register("account_type")}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.account_type && <p className="text-xs text-red-500 mt-1">{errors.account_type.message}</p>}
          </div>
        </div>

        <div>
          <Label className="text-slate-600 mb-1.5 block text-xs">Account Name <span className="text-red-500">*</span></Label>
          <Input
            className="border-slate-200"
            placeholder="e.g. Cash and Cash Equivalents"
            {...form.register("name")}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {parentAccounts.length > 0 && (
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Parent Account (optional)</Label>
            <select className={sel} {...form.register("parent_id")}>
              <option value="">— No parent —</option>
              {parentAccounts.map((a) => (
                <option key={a.id} value={a.id}>[{a.code}] {a.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        <strong>Tip:</strong> Use a consistent numbering scheme — e.g. 1xxx for assets, 2xxx for liabilities, 3xxx for equity, 4xxx for revenue, 5xxx for expenses.
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/finance/accounts")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : "Create Account"}
        </Button>
      </div>
    </form>
  )
}

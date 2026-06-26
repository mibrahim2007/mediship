"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { contactSchema, type ContactInput } from "@/lib/validations/crm"
import { createContactAction, updateContactAction } from "@/lib/actions/crm"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

const PAYMENT_TERMS = ["Immediate", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90"]

interface Props {
  defaultValues?: Partial<ContactInput>
  editId?: string
}

export function ContactForm({ defaultValues, editId }: Props) {
  const router = useRouter()
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "customer", country: "Pakistan", credit_limit: 0, ...defaultValues },
  })
  const { formState: { errors, isSubmitting } } = form

  async function onSubmit(data: ContactInput) {
    try {
      if (editId) {
        await updateContactAction(editId, data)
        toast.success("Contact updated")
        router.push(`/crm/contacts/${editId}`)
      } else {
        const contact = await createContactAction(data)
        toast.success(`${data.name} added`)
        router.push(`/crm/contacts/${contact.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save contact")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Contact Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Full Name <span className="text-red-500">*</span></Label>
            <Input className="border-slate-200" placeholder="Contact person name" {...form.register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Type <span className="text-red-500">*</span></Label>
            <select className={sel} {...form.register("type")}>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Company / Organization</Label>
            <Input className="border-slate-200" placeholder="Company name" {...form.register("company_name")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Email</Label>
            <Input type="email" className="border-slate-200" placeholder="email@example.com" {...form.register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Phone</Label>
            <Input className="border-slate-200" placeholder="+92 21 0000000" {...form.register("phone")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Mobile</Label>
            <Input className="border-slate-200" placeholder="+92 300 0000000" {...form.register("mobile")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Tax Reg No. (NTN/STRN)</Label>
            <Input className="border-slate-200 font-mono" placeholder="e.g. 1234567-8" {...form.register("tax_reg_no")} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Street Address</Label>
            <Input className="border-slate-200" placeholder="Street address" {...form.register("address")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">City</Label>
            <Input className="border-slate-200" placeholder="e.g. Karachi" {...form.register("city")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Country</Label>
            <Input className="border-slate-200" {...form.register("country")} />
          </div>
        </div>
      </div>

      {/* Financial */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Financial</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Credit Limit (PKR)</Label>
            <Input type="number" min="0" step="1000" className="border-slate-200" {...form.register("credit_limit")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Payment Terms</Label>
            <select className={sel} {...form.register("payment_terms")}>
              <option value="">— Select terms —</option>
              {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update Contact" : "Add Contact"}
        </Button>
      </div>
    </form>
  )
}

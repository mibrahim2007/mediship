"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { leadSchema, type LeadInput } from "@/lib/validations/crm"
import { createLeadAction, updateLeadAction } from "@/lib/actions/crm"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

const SOURCES = ["Website", "Referral", "LinkedIn", "Cold Call", "Email Campaign", "Trade Show", "Walk-in", "Other"]
const STAGES  = [
  { value: "new",         label: "New" },
  { value: "qualified",   label: "Qualified" },
  { value: "proposal",    label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won",         label: "Won" },
  { value: "lost",        label: "Lost" },
]

interface Contact { id: string; name: string; company_name?: string }
interface Props {
  contacts: Contact[]
  defaultValues?: Partial<LeadInput>
  editId?: string
}

export function LeadForm({ contacts, defaultValues, editId }: Props) {
  const router = useRouter()
  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      stage: "new", priority: "normal", lead_type: "lead",
      expected_revenue: 0, probability: 20,
      ...defaultValues,
    },
  })
  const { formState: { errors, isSubmitting } } = form

  async function onSubmit(data: LeadInput) {
    try {
      if (editId) {
        await updateLeadAction(editId, data)
        toast.success("Lead updated")
        router.push(`/crm/leads/${editId}`)
      } else {
        const lead = await createLeadAction(data)
        toast.success("Lead created")
        router.push(`/crm/leads/${lead.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save lead")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Lead Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Lead Name <span className="text-red-500">*</span></Label>
            <Input className="border-slate-200" placeholder="e.g. Hospital Supply Contract" {...form.register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Stage</Label>
            <select className={sel} {...form.register("stage")}>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Priority</Label>
            <select className={sel} {...form.register("priority")}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Lead Type</Label>
            <select className={sel} {...form.register("lead_type")}>
              <option value="lead">Lead</option>
              <option value="opportunity">Opportunity</option>
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Source</Label>
            <select className={sel} {...form.register("source")}>
              <option value="">— Select source —</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Contact Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-slate-600 text-xs">Link to Contact</Label>
              <a href="/crm/contacts/new" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                <Plus className="h-3 w-3" /> New Contact
              </a>
            </div>
            <select className={sel} {...form.register("contact_id")}>
              <option value="">— No linked contact —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company_name ? ` (${c.company_name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Contact Name</Label>
            <Input className="border-slate-200" placeholder="Person name" {...form.register("contact_name")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Company</Label>
            <Input className="border-slate-200" placeholder="Company name" {...form.register("company_name")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Phone</Label>
            <Input className="border-slate-200" placeholder="+92 300 0000000" {...form.register("phone")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Email</Label>
            <Input className="border-slate-200" type="email" placeholder="email@example.com" {...form.register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      {/* Opportunity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Opportunity</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Expected Revenue (PKR)</Label>
            <Input type="number" min="0" step="1" className="border-slate-200" {...form.register("expected_revenue")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Probability (%)</Label>
            <Input type="number" min="0" max="100" step="5" className="border-slate-200" {...form.register("probability")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Expected Close Date</Label>
            <Input type="date" className="border-slate-200" {...form.register("expected_closing")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Sales Team</Label>
            <Input className="border-slate-200" placeholder="e.g. Karachi Team" {...form.register("sales_team")} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Label className="text-slate-600 mb-1.5 block text-xs">Notes</Label>
        <textarea
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-teal-500 resize-none"
          rows={3}
          placeholder="Additional notes..."
          {...form.register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  )
}

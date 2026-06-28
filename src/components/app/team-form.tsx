"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { teamSchema, type TeamInput } from "@/lib/validations/teams"
import { createTeamAction, updateTeamAction } from "@/lib/actions/teams"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

interface Area { id: string; name: string; city?: string }
interface User { id: string; full_name?: string; role?: string }

interface Props {
  areas: Area[]
  salesReps: User[]
  defaultValues?: Partial<TeamInput>
  editId?: string
}

export function TeamForm({ areas, salesReps, defaultValues, editId }: Props) {
  const router = useRouter()
  const form = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: { target_amount: 0, ...defaultValues },
  })
  const { formState: { errors, isSubmitting } } = form

  async function onSubmit(data: TeamInput) {
    try {
      if (editId) {
        await updateTeamAction(editId, data)
        toast.success("Team updated")
        router.push(`/sales/teams/${editId}`)
      } else {
        const team = await createTeamAction(data)
        toast.success("Team created")
        router.push(`/sales/teams/${team.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save team")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Team Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Team Name <span className="text-red-500">*</span></Label>
            <Input className="border-slate-200" placeholder="e.g. Lahore North Team" {...form.register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Area</Label>
            <select className={sel} {...form.register("area_id")}>
              <option value="">— Select area —</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.city ? ` (${a.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Team Lead</Label>
            <select className={sel} {...form.register("team_lead_id")}>
              <option value="">— No lead assigned —</option>
              {salesReps.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name ?? u.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Monthly Sales Target (PKR)</Label>
            <Input
              type="number" min="0" step="1000"
              className="border-slate-200"
              {...form.register("target_amount")}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Label className="text-slate-600 mb-1.5 block text-xs">Notes</Label>
        <textarea
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-teal-500 resize-none"
          rows={3}
          placeholder="Additional notes about this team..."
          {...form.register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update Team" : "Create Team"}
        </Button>
      </div>
    </form>
  )
}

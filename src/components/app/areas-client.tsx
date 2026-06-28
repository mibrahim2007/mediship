"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MapPin, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { areaSchema, type AreaInput } from "@/lib/validations/teams"
import { createAreaAction, updateAreaAction, deleteAreaAction } from "@/lib/actions/teams"

interface Area {
  id: string
  name: string
  code?: string | null
  city?: string | null
  region?: string | null
  description?: string | null
  is_active: boolean
  created_at: string
  sale_teams?: { id: string }[]
}

const fieldCls =
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500"

function AreaForm({
  defaultValues,
  onSave,
  onCancel,
  saving,
}: {
  defaultValues?: Partial<AreaInput>
  onSave: (data: AreaInput) => void
  onCancel: () => void
  saving: boolean
}) {
  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: defaultValues ?? {},
  })
  const { formState: { errors } } = form

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs text-slate-600 mb-1 block">Area Name <span className="text-red-500">*</span></Label>
          <Input className="border-slate-200" placeholder="e.g. Lahore North" {...form.register("name")} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Code</Label>
          <Input className="border-slate-200" placeholder="e.g. LHR-N" {...form.register("code")} />
        </div>

        <div>
          <Label className="text-xs text-slate-600 mb-1 block">City</Label>
          <Input className="border-slate-200" placeholder="e.g. Lahore" {...form.register("city")} />
        </div>

        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Region / Province</Label>
          <Input className="border-slate-200" placeholder="e.g. Punjab" {...form.register("region")} />
        </div>

        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Description</Label>
          <Input className="border-slate-200" placeholder="Optional notes" {...form.register("description")} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
          {saving ? "Saving..." : <><Check className="h-4 w-4 mr-1" /> Save</>}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-slate-500">
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
      </div>
    </form>
  )
}

export function AreasClient({ initialAreas }: { initialAreas: Area[] }) {
  const [areas, setAreas] = useState<Area[]>(initialAreas)
  const [showNew, setShowNew] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  function handleCreate(data: AreaInput) {
    setSaving(true)
    startTransition(async () => {
      try {
        const area = await createAreaAction(data) as any
        setAreas((prev) => [...prev, { ...area, sale_teams: [] }].sort((a, b) => a.name.localeCompare(b.name)))
        setShowNew(false)
        toast.success("Area created")
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to create area")
      } finally {
        setSaving(false)
      }
    })
  }

  function handleUpdate(id: string, data: AreaInput) {
    setSaving(true)
    startTransition(async () => {
      try {
        await updateAreaAction(id, data)
        setAreas((prev) =>
          prev.map((a) => a.id === id ? { ...a, ...data } : a)
        )
        setEditId(null)
        toast.success("Area updated")
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to update area")
      } finally {
        setSaving(false)
      }
    })
  }

  function handleDelete(id: string, name: string, teamCount: number) {
    if (teamCount > 0) {
      toast.error(`Cannot delete — ${teamCount} team(s) are assigned to this area`)
      return
    }
    if (!confirm(`Delete area "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteAreaAction(id)
        setAreas((prev) => prev.filter((a) => a.id !== id))
        toast.success("Area deleted")
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to delete area")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* New area form */}
      {showNew && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-teal-800 mb-4">New Distribution Area</h3>
          <AreaForm
            onSave={handleCreate}
            onCancel={() => setShowNew(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Area cards */}
      {areas.length === 0 && !showNew ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <MapPin className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No areas yet</p>
          <p className="text-slate-400 text-sm mt-1">Add distribution areas to organize your sales teams</p>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 mt-4" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add First Area
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map((area) => {
            const teamCount = area.sale_teams?.length ?? 0
            const isEditing = editId === area.id

            return (
              <div key={area.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {isEditing ? (
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Edit Area</h3>
                    <AreaForm
                      defaultValues={{
                        name:        area.name,
                        code:        area.code ?? "",
                        city:        area.city ?? "",
                        region:      area.region ?? "",
                        description: area.description ?? "",
                      }}
                      onSave={(data) => handleUpdate(area.id, data)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{area.name}</p>
                        {area.code && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            {area.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        {area.city && <span>{area.city}</span>}
                        {area.region && <span>· {area.region}</span>}
                        {area.description && <span>· {area.description}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {teamCount} team{teamCount !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => setEditId(area.id)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id, area.name, teamCount)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!showNew && areas.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={() => setShowNew(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Area
        </Button>
      )}
    </div>
  )
}

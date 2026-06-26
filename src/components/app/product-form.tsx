"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { productSchema, type ProductInput } from "@/lib/validations/inventory"
import { createProductAction, updateProductAction } from "@/lib/actions/inventory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Surgical Supplies",
  "Diagnostic Equipment",
  "Personal Protective Equipment",
  "Medications",
  "Wound Care",
  "Orthopaedic",
  "IV & Infusion",
  "Laboratory Supplies",
  "Sterilization",
  "Patient Care",
  "Other",
]

const COMMON_UOM = ["pcs", "box", "pack", "bottle", "vial", "tube", "pair", "set", "kg", "g", "L", "mL"]

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

interface Props { defaultValues?: Partial<ProductInput>; editId?: string }

export function ProductForm({ defaultValues, editId }: Props) {
  const router = useRouter()
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      cost_price: 0, sales_price: 0, tax_rate: 0,
      reorder_point: 0, reorder_qty: 0,
      ...defaultValues,
    },
  })

  const { formState: { errors, isSubmitting } } = form

  async function onSubmit(data: ProductInput) {
    try {
      if (editId) {
        await updateProductAction(editId, data)
        toast.success("Product updated")
        router.push(`/stocks/products/${editId}`)
      } else {
        const product = await createProductAction(data)
        toast.success(`${product.name} added`)
        router.push(`/stocks/products/${product.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save product")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Product Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-slate-600 mb-1.5 block text-xs">Product Name <span className="text-red-500">*</span></Label>
            <Input className="border-slate-200" placeholder="e.g. Surgical Gloves (Medium)" {...form.register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">SKU / Internal Ref</Label>
            <Input className="border-slate-200 font-mono" placeholder="e.g. SG-MED-001" {...form.register("internal_ref")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Category</Label>
            <select className={sel} {...form.register("category")}>
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Unit of Measure <span className="text-red-500">*</span></Label>
            <select className={sel} {...form.register("uom")}>
              <option value="">— Select UoM —</option>
              {COMMON_UOM.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.uom && <p className="text-xs text-red-500 mt-1">{errors.uom.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Tax Rate (%)</Label>
            <Input type="number" step="0.01" min="0" max="100" className="border-slate-200" {...form.register("tax_rate")} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Pricing</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Cost Price (PKR)</Label>
            <Input type="number" step="0.01" min="0" className="border-slate-200" {...form.register("cost_price")} />
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Sales Price (PKR)</Label>
            <Input type="number" step="0.01" min="0" className="border-slate-200" {...form.register("sales_price")} />
          </div>
        </div>
      </div>

      {/* Reorder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Reorder Rules</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Reorder Point</Label>
            <Input type="number" step="1" min="0" className="border-slate-200" placeholder="0" {...form.register("reorder_point")} />
            <p className="text-xs text-slate-400 mt-1">Alert when stock falls to this level</p>
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Reorder Quantity</Label>
            <Input type="number" step="1" min="0" className="border-slate-200" placeholder="0" {...form.register("reorder_qty")} />
            <p className="text-xs text-slate-400 mt-1">Suggested quantity to reorder</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/stocks")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { stockAdjustSchema, type StockAdjustInput } from "@/lib/validations/inventory"
import { createStockAdjustmentAction } from "@/lib/actions/inventory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency } from "@/lib/utils"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface Product { id: string; name: string; internal_ref?: string; cost_price: number; uom: string }
interface Props { products: Product[]; defaultProductId?: string }

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

export function StockAdjustForm({ products, defaultProductId }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<StockAdjustInput>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: {
      product_id: defaultProductId ?? "",
      direction: "in",
      quantity: 1,
      unit_cost: 0,
      move_date: today,
    },
  })

  const { formState: { errors, isSubmitting } } = form
  const productId = useWatch({ control: form.control, name: "product_id" })
  const direction = useWatch({ control: form.control, name: "direction" })
  const quantity  = useWatch({ control: form.control, name: "quantity" })
  const unitCost  = useWatch({ control: form.control, name: "unit_cost" })

  const selectedProduct = products.find((p) => p.id === productId)
  const totalValue = (Number(quantity) || 0) * (Number(unitCost) || 0)

  function onProductChange(id: string) {
    const p = products.find((x) => x.id === id)
    if (p) form.setValue("unit_cost", p.cost_price)
  }

  async function onSubmit(data: StockAdjustInput) {
    try {
      await createStockAdjustmentAction(data)
      const sign = data.direction === "in" ? "+" : "-"
      toast.success(`Stock ${sign}${data.quantity} recorded`)
      router.push(`/stocks/products/${data.product_id}`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to adjust stock")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {/* Direction toggle */}
        <div>
          <Label className="text-slate-600 mb-2 block text-xs">Adjustment Type <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "in",  label: "Add Stock (Receive)",   icon: ArrowDownToLine, color: "border-teal-500 bg-teal-50 text-teal-700" },
              { value: "out", label: "Remove Stock (Write-off)", icon: ArrowUpFromLine, color: "border-red-400 bg-red-50 text-red-700" },
            ].map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => form.setValue("direction", value as "in" | "out")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all",
                  direction === value ? color : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <Label className="text-slate-600 mb-1.5 block text-xs">Product <span className="text-red-500">*</span></Label>
          <select
            className={sel}
            {...form.register("product_id")}
            onChange={(e) => { form.setValue("product_id", e.target.value); onProductChange(e.target.value) }}
          >
            <option value="">— Select product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.internal_ref ? `[${p.internal_ref}] ` : ""}{p.name}
              </option>
            ))}
          </select>
          {errors.product_id && <p className="text-xs text-red-500 mt-1">{errors.product_id.message}</p>}
        </div>

        {/* Quantity & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">
              Quantity {selectedProduct && <span className="text-slate-400">({selectedProduct.uom})</span>}
              <span className="text-red-500"> *</span>
            </Label>
            <Input type="number" step="0.01" min="0.01" className="border-slate-200" {...form.register("quantity")} />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Unit Cost (PKR)</Label>
            <Input type="number" step="0.01" min="0" className="border-slate-200" {...form.register("unit_cost")} />
          </div>
        </div>

        {totalValue > 0 && (
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-sm">
            <span className="text-slate-500">Total Value</span>
            <span className="font-semibold text-slate-900">{formatCurrency(totalValue)}</span>
          </div>
        )}

        {/* Date & Reference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Date <span className="text-red-500">*</span></Label>
            <Input type="date" className="border-slate-200" {...form.register("move_date")} />
          </div>
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Reference</Label>
            <Input className="border-slate-200" placeholder="e.g. ADJ-001" {...form.register("reference")} />
          </div>
        </div>

        <div>
          <Label className="text-slate-600 mb-1.5 block text-xs">Notes</Label>
          <textarea
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-teal-500 resize-none"
            rows={2}
            placeholder="Reason for adjustment..."
            {...form.register("notes")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/stocks")}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn("min-w-36", direction === "out" ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700")}
        >
          {isSubmitting ? "Saving..." : direction === "in" ? "Add Stock" : "Remove Stock"}
        </Button>
      </div>
    </form>
  )
}

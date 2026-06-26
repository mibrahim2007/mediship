"use client"

import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations/purchase"
import { createPurchaseOrderAction, updatePurchaseOrderAction } from "@/lib/actions/purchase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency } from "@/lib/utils"

interface Vendor   { id: string; name: string; payment_terms?: string }
interface Warehouse { id: string; name: string; code: string }
interface Product  { id: string; name: string; uom: string; cost_price: number; tax_rate: number; internal_ref?: string }

interface Props {
  vendors: Vendor[]
  warehouses: Warehouse[]
  products: Product[]
  editId?: string
  defaultValues?: Partial<PurchaseOrderInput>
}

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[&>option]:bg-white"
)

const PAYMENT_TERMS = ["Immediate", "Net 15", "Net 30", "Net 60", "Net 90"]

function calcLine(qty: number, price: number) {
  return qty * price
}

export function PurchaseOrderForm({ vendors, warehouses, products, editId, defaultValues }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      order_date: today,
      status: "rfq",
      lines: [{ quantity: 1, unit_price: 0, tax_rate: 0, subtotal: 0, sort_order: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" })
  const lines = useWatch({ control: form.control, name: "lines" })

  useEffect(() => {
    lines?.forEach((l, i) => {
      const computed = calcLine(Number(l.quantity) || 0, Number(l.unit_price) || 0)
      if (Math.abs(computed - (Number(l.subtotal) || 0)) > 0.001) {
        form.setValue(`lines.${i}.subtotal`, computed, { shouldDirty: false })
      }
    })
  }, [lines?.map((l) => `${l.quantity}|${l.unit_price}`).join(",")])

  const subtotal = (lines ?? []).reduce((s, l) => s + (Number(l.subtotal) || 0), 0)
  const taxAmount = (lines ?? []).reduce((s, l) => {
    const base = calcLine(Number(l.quantity) || 0, Number(l.unit_price) || 0)
    return s + base * ((Number(l.tax_rate) || 0) / 100)
  }, 0)
  const total = subtotal + taxAmount

  function onProductChange(index: number, productId: string) {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    form.setValue(`lines.${index}.unit_price`, p.cost_price)
    form.setValue(`lines.${index}.uom`, p.uom)
    form.setValue(`lines.${index}.tax_rate`, Number(p.tax_rate))
    form.setValue(`lines.${index}.description`, p.name)
  }

  function onVendorChange(vendorId: string) {
    const v = vendors.find((x) => x.id === vendorId)
    if (v?.payment_terms) form.setValue("payment_terms", v.payment_terms)
  }

  async function onSubmit(data: PurchaseOrderInput) {
    try {
      if (editId) {
        await updatePurchaseOrderAction(editId, data)
        toast.success("Purchase order updated")
        router.push(`/purchase/${editId}`)
      } else {
        const order = await createPurchaseOrderAction(data)
        toast.success(`${order.order_no} created`)
        router.push(`/purchase/${order.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save PO")
    }
  }

  const { formState: { errors, isSubmitting } } = form

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Order Details</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Vendor</Label>
            <select
              className={sel}
              {...form.register("vendor_id")}
              onChange={(e) => { form.setValue("vendor_id", e.target.value); onVendorChange(e.target.value) }}
            >
              <option value="">— No vendor —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Order Date <span className="text-red-500">*</span></Label>
            <Input type="date" className="border-slate-200" {...form.register("order_date")} />
            {errors.order_date && <p className="text-xs text-red-500 mt-1">{errors.order_date.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Delivery Deadline</Label>
            <Input type="date" className="border-slate-200" {...form.register("order_deadline")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Deliver To (Warehouse)</Label>
            <select className={sel} {...form.register("warehouse_id")}>
              <option value="">— None —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Payment Terms</Label>
            <select className={sel} {...form.register("payment_terms")}>
              <option value="">— Select —</option>
              {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Status</Label>
            <select className={sel} {...form.register("status")}>
              <option value="rfq">RFQ (Draft)</option>
              <option value="purchase_order">Purchase Order</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-slate-600 mb-1.5 block text-xs">Notes</Label>
          <textarea
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 resize-none"
            rows={2}
            placeholder="Internal notes..."
            {...form.register("notes")}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Products to Order</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-40">Product</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Description</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-20">Qty</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-16">UoM</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-24">Unit Cost</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-16">Tax%</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-24">Subtotal</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={field.id} className="border-b border-slate-50">
                  <td className="px-2 py-2">
                    <select
                      className={cn(sel, "text-xs")}
                      onChange={(e) => onProductChange(i, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.internal_ref ? `[${p.internal_ref}] ` : ""}{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <Input className="border-slate-200 h-8 text-xs" placeholder="Description" {...form.register(`lines.${i}.description`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" step="0.01" min="0" className="border-slate-200 h-8 text-xs" {...form.register(`lines.${i}.quantity`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="border-slate-200 h-8 text-xs" placeholder="pcs" {...form.register(`lines.${i}.uom`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" step="0.01" min="0" className="border-slate-200 h-8 text-xs" {...form.register(`lines.${i}.unit_price`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input type="number" step="0.01" min="0" max="100" className="border-slate-200 h-8 text-xs" {...form.register(`lines.${i}.tax_rate`)} />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800 text-xs">
                    {formatCurrency(Number(lines[i]?.subtotal) || 0)}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => append({ quantity: 1, unit_price: 0, tax_rate: 0, subtotal: 0, sort_order: fields.length })}
            className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Line
          </button>
          {typeof errors.lines?.message === "string" && (
            <p className="text-xs text-red-500 mt-1">{errors.lines.message}</p>
          )}
        </div>
      </div>

      {/* Totals + Actions */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1" />
        <div className="w-72 space-y-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tax</span><span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900 text-base border-t border-slate-100 pt-2">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/purchase")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update PO" : "Save PO"}
        </Button>
      </div>
    </form>
  )
}

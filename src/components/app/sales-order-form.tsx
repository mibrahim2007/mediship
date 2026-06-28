"use client"

import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Check, ChevronDown, Plus, Search, Trash2, UserPlus } from "lucide-react"
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations/sales"
import { createSalesOrderAction, updateSalesOrderAction } from "@/lib/actions/sales"
import { createContactAction } from "@/lib/actions/crm"
import { createProductAction } from "@/lib/actions/inventory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

interface Customer { id: string; name: string; payment_terms?: string }
interface Warehouse { id: string; name: string; code: string }
interface Product { id: string; name: string; uom: string; sales_price: number; tax_rate: number; internal_ref?: string }

interface Props {
  customers: Customer[]
  warehouses: Warehouse[]
  products: Product[]
  editId?: string
  defaultValues?: Partial<SalesOrderInput>
}

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[&>option]:bg-white"
)

const PAYMENT_TERMS = ["Immediate", "Net 15", "Net 30", "Net 60", "Net 90"]

function calcLine(qty: number, price: number, disc: number, _tax: number) {
  const base = qty * price * (1 - disc / 100)
  return base
}

const PAYMENT_TERMS_LIST = ["Immediate", "Net 15", "Net 30", "Net 60", "Net 90"]

export function SalesOrderForm({ customers, warehouses, products, editId, defaultValues }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  // local customer list so newly created customers appear immediately
  const [customerList, setCustomerList] = useState<Customer[]>(customers)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCust, setNewCust] = useState({ name: "", company_name: "", email: "", phone: "", payment_terms: "" })

  async function handleCreateCustomer() {
    if (!newCust.name.trim()) return
    setCreating(true)
    try {
      const contact = await createContactAction({
        name: newCust.name.trim(),
        company_name: newCust.company_name || undefined,
        email: newCust.email || "",
        phone: newCust.phone || undefined,
        payment_terms: newCust.payment_terms || undefined,
        type: "customer",
        country: "Pakistan",
        credit_limit: 0,
      })
      const created: Customer = { id: contact.id, name: contact.name, payment_terms: contact.payment_terms ?? undefined }
      setCustomerList(prev => [...prev, created])
      form.setValue("customer_id", contact.id)
      if (contact.payment_terms) form.setValue("payment_terms", contact.payment_terms)
      setCreateOpen(false)
      setNewCust({ name: "", company_name: "", email: "", phone: "", payment_terms: "" })
      toast.success(`${contact.name} added as customer`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create customer")
    } finally {
      setCreating(false)
    }
  }

  // product picker state
  const [productList, setProductList] = useState<Product[]>(products)
  const [pickerLine, setPickerLine] = useState<number | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [pendingLine, setPendingLine] = useState<number | null>(null)
  const [productCreateOpen, setProductCreateOpen] = useState(false)
  const [productCreating, setProductCreating] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", internal_ref: "", uom: "pcs", sales_price: "0", cost_price: "0", tax_rate: "0" })

  async function handleCreateProduct() {
    if (!newProduct.name.trim() || !newProduct.uom.trim()) return
    setProductCreating(true)
    try {
      const p = await createProductAction({
        name: newProduct.name.trim(),
        internal_ref: newProduct.internal_ref || undefined,
        uom: newProduct.uom.trim(),
        sales_price: Number(newProduct.sales_price) || 0,
        cost_price: Number(newProduct.cost_price) || 0,
        tax_rate: Number(newProduct.tax_rate) || 0,
        reorder_point: 0,
        reorder_qty: 0,
      })
      const created: Product = { id: p.id, name: p.name, uom: p.uom, sales_price: p.sales_price, tax_rate: p.tax_rate, internal_ref: p.internal_ref ?? undefined }
      setProductList(prev => [...prev, created])
      if (pendingLine !== null) {
        form.setValue(`lines.${pendingLine}.product_id`, p.id)
        form.setValue(`lines.${pendingLine}.unit_price`, p.sales_price)
        form.setValue(`lines.${pendingLine}.uom`, p.uom)
        form.setValue(`lines.${pendingLine}.tax_rate`, Number(p.tax_rate))
        form.setValue(`lines.${pendingLine}.description`, p.name)
        setPendingLine(null)
      }
      setProductCreateOpen(false)
      setNewProduct({ name: "", internal_ref: "", uom: "pcs", sales_price: "0", cost_price: "0", tax_rate: "0" })
      toast.success(`${p.name} created`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create product")
    } finally {
      setProductCreating(false)
    }
  }

  const form = useForm<SalesOrderInput>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      order_date: today,
      status: "quotation",
      lines: [{ quantity: 1, unit_price: 0, discount: 0, tax_rate: 0, subtotal: 0, sort_order: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" })
  const lines = useWatch({ control: form.control, name: "lines" })

  // Auto-compute subtotals whenever qty / price / discount change
  useEffect(() => {
    lines?.forEach((l, i) => {
      const computed = calcLine(Number(l.quantity) || 0, Number(l.unit_price) || 0, Number(l.discount) || 0, 0)
      if (Math.abs(computed - (Number(l.subtotal) || 0)) > 0.001) {
        form.setValue(`lines.${i}.subtotal`, computed, { shouldDirty: false })
      }
    })
  }, [lines?.map((l) => `${l.quantity}|${l.unit_price}|${l.discount}`).join(",")])

  const subtotal = (lines ?? []).reduce((s, l) => s + (Number(l.subtotal) || 0), 0)
  const taxAmount = (lines ?? []).reduce((s, l) => {
    const base = calcLine(Number(l.quantity) || 0, Number(l.unit_price) || 0, Number(l.discount) || 0, 0)
    return s + base * ((Number(l.tax_rate) || 0) / 100)
  }, 0)
  const total = subtotal + taxAmount

  function onProductChange(index: number, productId: string) {
    const p = productList.find((x) => x.id === productId)
    if (!p) return
    form.setValue(`lines.${index}.product_id`, productId)
    form.setValue(`lines.${index}.unit_price`, p.sales_price)
    form.setValue(`lines.${index}.uom`, p.uom)
    form.setValue(`lines.${index}.tax_rate`, Number(p.tax_rate))
    form.setValue(`lines.${index}.description`, p.name)
  }

  function onCustomerChange(customerId: string) {
    const c = customerList.find((x) => x.id === customerId)
    if (c?.payment_terms) form.setValue("payment_terms", c.payment_terms)
  }

  async function onSubmit(data: SalesOrderInput) {
    try {
      if (editId) {
        await updateSalesOrderAction(editId, data)
        toast.success("Order updated")
        router.push(`/sales/${editId}`)
      } else {
        const order = await createSalesOrderAction(data)
        toast.success(`Order ${order.order_no} created`)
        router.push(`/sales/${order.id}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save order")
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
            <Label className="text-slate-600 mb-1.5 block text-xs">Customer</Label>
            {/* hidden input keeps the value in RHF */}
            <input type="hidden" {...form.register("customer_id")} />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={cn(
                sel,
                "text-left flex items-center justify-between gap-2 cursor-pointer",
                !form.watch("customer_id") && "text-slate-400"
              )}
            >
              <span className="truncate">
                {customerList.find(c => c.id === form.watch("customer_id"))?.name ?? "— Walk-in / No customer —"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Order Date <span className="text-red-500">*</span></Label>
            <Input type="date" className="border-slate-200" {...form.register("order_date")} />
            {errors.order_date && <p className="text-xs text-red-500 mt-1">{errors.order_date.message}</p>}
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Expiry Date</Label>
            <Input type="date" className="border-slate-200" {...form.register("expiry_date")} />
          </div>

          <div>
            <Label className="text-slate-600 mb-1.5 block text-xs">Warehouse</Label>
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
              <option value="quotation">Quotation</option>
              <option value="sales_order">Sales Order</option>
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
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Line Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-40">Product</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Description</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-20">Qty</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-16">UoM</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-24">Unit Price</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-16">Disc%</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-16">Tax%</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-24">Subtotal</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, i) => (
                <tr key={field.id} className="border-b border-slate-50">
                  <td className="px-2 py-2">
                    <input type="hidden" {...form.register(`lines.${i}.product_id`)} />
                    <button
                      type="button"
                      onClick={() => { setPickerLine(i); setProductSearch("") }}
                      className={cn(
                        sel, "h-8 text-xs text-left flex items-center justify-between gap-1 cursor-pointer",
                        !lines[i]?.product_id && "text-slate-400"
                      )}
                    >
                      <span className="truncate">
                        {productList.find(p => p.id === lines[i]?.product_id)
                          ? `${productList.find(p => p.id === lines[i]?.product_id)?.internal_ref ? `[${productList.find(p => p.id === lines[i]?.product_id)?.internal_ref}] ` : ""}${productList.find(p => p.id === lines[i]?.product_id)?.name}`
                          : "Select product..."}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <Input className="border-slate-200 h-8 text-xs" placeholder="Description" {...form.register(`lines.${i}.description`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number" step="0.01" min="0"
                      className="border-slate-200 h-8 text-xs"
                      {...form.register(`lines.${i}.quantity`)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="border-slate-200 h-8 text-xs" placeholder="pcs" {...form.register(`lines.${i}.uom`)} />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number" step="0.01" min="0"
                      className="border-slate-200 h-8 text-xs"
                      {...form.register(`lines.${i}.unit_price`)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number" step="0.01" min="0" max="100"
                      className="border-slate-200 h-8 text-xs"
                      {...form.register(`lines.${i}.discount`)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number" step="0.01" min="0" max="100"
                      className="border-slate-200 h-8 text-xs"
                      {...form.register(`lines.${i}.tax_rate`)}
                    />
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
            onClick={() => append({ quantity: 1, unit_price: 0, discount: 0, tax_rate: 0, subtotal: 0, sort_order: fields.length })}
            className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Line
          </button>
          {errors.lines?.root && <p className="text-xs text-red-500 mt-1">{errors.lines.root.message}</p>}
          {typeof errors.lines?.message === "string" && <p className="text-xs text-red-500 mt-1">{errors.lines.message}</p>}
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
        <Button type="button" variant="ghost" className="text-slate-500" onClick={() => router.push("/sales")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-36">
          {isSubmitting ? "Saving..." : editId ? "Update Order" : "Save Order"}
        </Button>
      </div>

      {/* ── Product picker dialog (per line) ── */}
      <Dialog open={pickerLine !== null} onOpenChange={(open) => { if (!open) { setPickerLine(null); setProductSearch("") } }}>
        <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden" showCloseButton={false}>
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-slate-100">
            <DialogTitle className="text-base">Select Product</DialogTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                autoFocus
                placeholder="Search by name or SKU..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="pl-8 border-slate-200 h-8 text-sm"
              />
            </div>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto">
            {productList
              .filter(p =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.internal_ref ?? "").toLowerCase().includes(productSearch.toLowerCase())
              )
              .map(p => {
                const isSelected = pickerLine !== null && lines[pickerLine]?.product_id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (pickerLine !== null) onProductChange(pickerLine, p.id)
                      setPickerLine(null)
                      setProductSearch("")
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors",
                      isSelected && "bg-teal-50 text-teal-700"
                    )}
                  >
                    <div className="min-w-0">
                      <span className="truncate font-medium">{p.name}</span>
                      {p.internal_ref && <span className={cn("ml-1.5 text-xs", isSelected ? "text-teal-500" : "text-slate-400")}>[{p.internal_ref}]</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className={isSelected ? "text-teal-500" : "text-slate-400"}>{p.uom}</span>
                      <span className={cn("font-medium", isSelected ? "text-teal-700" : "text-slate-600")}>{p.sales_price.toLocaleString()}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                )
              })
            }
            {productList.filter(p =>
              p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
              (p.internal_ref ?? "").toLowerCase().includes(productSearch.toLowerCase())
            ).length === 0 && (
              <p className="px-4 py-8 text-sm text-slate-400 text-center">No products found</p>
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setPendingLine(pickerLine); setPickerLine(null); setProductSearch(""); setProductCreateOpen(true) }}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Product
            </button>
            <button
              type="button"
              onClick={() => { setPickerLine(null); setProductSearch("") }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quick-create product dialog ── */}
      <Dialog open={productCreateOpen} onOpenChange={(open) => setProductCreateOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-teal-600" /> New Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-slate-600 mb-1.5 block text-xs">Product Name <span className="text-red-500">*</span></Label>
                <Input className="border-slate-200" placeholder="e.g. Panadol 500mg" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">SKU / Ref</Label>
                <Input className="border-slate-200" placeholder="SKU-001" value={newProduct.internal_ref} onChange={e => setNewProduct(p => ({ ...p, internal_ref: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">UoM <span className="text-red-500">*</span></Label>
                <Input className="border-slate-200" placeholder="pcs" value={newProduct.uom} onChange={e => setNewProduct(p => ({ ...p, uom: e.target.value }))} />
              </div>
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">Sales Price</Label>
                <Input type="number" min="0" step="0.01" className="border-slate-200" value={newProduct.sales_price} onChange={e => setNewProduct(p => ({ ...p, sales_price: e.target.value }))} />
              </div>
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">Tax %</Label>
                <Input type="number" min="0" max="100" step="0.01" className="border-slate-200" value={newProduct.tax_rate} onChange={e => setNewProduct(p => ({ ...p, tax_rate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setProductCreateOpen(false); setPendingLine(null); setNewProduct({ name: "", internal_ref: "", uom: "pcs", sales_price: "0", cost_price: "0", tax_rate: "0" }) }}>Cancel</Button>
            <Button type="button" disabled={productCreating || !newProduct.name.trim() || !newProduct.uom.trim()} onClick={handleCreateProduct} className="bg-teal-600 hover:bg-teal-700">
              {productCreating ? "Creating..." : "Create & Select"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Customer picker dialog (LOV) ── */}
      <Dialog open={pickerOpen} onOpenChange={(open) => { setPickerOpen(open); if (!open) setSearch("") }}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden" showCloseButton={false}>
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-slate-100">
            <DialogTitle className="text-base">Select Customer</DialogTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                autoFocus
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 border-slate-200 h-8 text-sm"
              />
            </div>
          </DialogHeader>

          <div className="max-h-64 overflow-y-auto">
            {/* Walk-in option */}
            <button
              type="button"
              onClick={() => { form.setValue("customer_id", ""); setPickerOpen(false); setSearch("") }}
              className={cn(
                "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors border-b border-slate-50",
                !form.watch("customer_id") ? "bg-teal-50 text-teal-700" : "text-slate-400 italic"
              )}
            >
              <span>Walk-in / No customer</span>
              {!form.watch("customer_id") && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>

            {customerList
              .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
              .map(c => {
                const isSelected = form.watch("customer_id") === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      form.setValue("customer_id", c.id)
                      onCustomerChange(c.id)
                      setPickerOpen(false)
                      setSearch("")
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors",
                      isSelected && "bg-teal-50 text-teal-700"
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.payment_terms && (
                        <span className={cn("text-xs", isSelected ? "text-teal-500" : "text-slate-400")}>
                          {c.payment_terms}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                )
              })
            }

            {customerList.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <p className="px-4 py-8 text-sm text-slate-400 text-center">No customers found</p>
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setPickerOpen(false); setSearch(""); setCreateOpen(true) }}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" /> New Customer
            </button>
            <button
              type="button"
              onClick={() => { setPickerOpen(false); setSearch("") }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quick-create customer dialog ── */}
      <Dialog open={createOpen} onOpenChange={(open) => setCreateOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-teal-600" /> New Customer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <Label className="text-slate-600 mb-1.5 block text-xs">Full Name <span className="text-red-500">*</span></Label>
              <Input
                className="border-slate-200"
                placeholder="Contact person name"
                value={newCust.name}
                onChange={e => setNewCust(p => ({ ...p, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <Label className="text-slate-600 mb-1.5 block text-xs">Company / Organization</Label>
              <Input
                className="border-slate-200"
                placeholder="Company name"
                value={newCust.company_name}
                onChange={e => setNewCust(p => ({ ...p, company_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">Email</Label>
                <Input
                  type="email"
                  className="border-slate-200"
                  placeholder="email@example.com"
                  value={newCust.email}
                  onChange={e => setNewCust(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-slate-600 mb-1.5 block text-xs">Phone</Label>
                <Input
                  className="border-slate-200"
                  placeholder="+92 300 0000000"
                  value={newCust.phone}
                  onChange={e => setNewCust(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-600 mb-1.5 block text-xs">Payment Terms</Label>
              <select
                className={cn(sel)}
                value={newCust.payment_terms}
                onChange={e => setNewCust(p => ({ ...p, payment_terms: e.target.value }))}
              >
                <option value="">— Select terms —</option>
                {PAYMENT_TERMS_LIST.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setCreateOpen(false); setNewCust({ name: "", company_name: "", email: "", phone: "", payment_terms: "" }) }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={creating || !newCust.name.trim()}
              onClick={handleCreateCustomer}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {creating ? "Creating..." : "Create & Select"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

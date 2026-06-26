import { requireTenantSession } from "@/lib/auth/session"
import { getPurchaseOrderById, getVendors, getWarehouses, getPurchaseProducts } from "@/lib/db/purchase"
import { PurchaseOrderForm } from "@/components/app/purchase-order-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditPurchaseOrderPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const [order, vendors, warehouses, products] = await Promise.all([
    getPurchaseOrderById(params.id, session.companyId!),
    getVendors(session.companyId!),
    getWarehouses(session.companyId!),
    getPurchaseProducts(session.companyId!),
  ])
  if (!order) notFound()

  if (!["rfq", "rfq_sent"].includes(order.status)) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Cannot edit this purchase order</h1>
        <p className="text-slate-500 text-sm mb-4">Only RFQs can be edited after confirmation.</p>
        <Link href={"/purchase/" + params.id} className="text-teal-600 hover:underline text-sm">Back to order</Link>
      </div>
    )
  }

  const lines = (order as any).lines ?? []

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={"/purchase/" + params.id} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Purchase Order</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-mono">{order.order_no}</p>
        </div>
      </div>

      <PurchaseOrderForm
        vendors={vendors}
        warehouses={warehouses}
        products={products}
        editId={params.id}
        defaultValues={{
          order_date:     order.order_date,
          order_deadline: order.order_deadline ?? undefined,
          vendor_id:      order.vendor_id ?? undefined,
          warehouse_id:   order.warehouse_id ?? undefined,
          payment_terms:  order.payment_terms ?? undefined,
          notes:          order.notes ?? undefined,
          status:         order.status as any,
          lines: lines.map((l: any) => ({
            product_id:  l.product_id ?? undefined,
            description: l.description ?? undefined,
            quantity:    Number(l.quantity),
            uom:         l.uom ?? undefined,
            unit_price:  Number(l.unit_price),
            tax_rate:    Number(l.tax_rate ?? 0),
            subtotal:    Number(l.subtotal),
            sort_order:  l.sort_order ?? 0,
          })),
        }}
      />
    </div>
  )
}

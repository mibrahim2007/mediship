"use server"

import { requireTenantSession } from "@/lib/auth/session"
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  getNextPoNo,
} from "@/lib/db/purchase"
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations/purchase"
import { revalidatePath } from "next/cache"

export async function createPurchaseOrderAction(input: PurchaseOrderInput) {
  const session = await requireTenantSession()
  const data = purchaseOrderSchema.parse(input)

  const subtotal = data.lines.reduce((s, l) => s + (Number(l.subtotal) || 0), 0)
  const taxAmount = data.lines.reduce((s, l) => {
    const base = Number(l.quantity) * Number(l.unit_price)
    return s + base * ((Number(l.tax_rate) || 0) / 100)
  }, 0)
  const total = subtotal + taxAmount

  const order_no = await getNextPoNo(session.companyId!)

  const order = await createPurchaseOrder({
    company_id: session.companyId!,
    order_no,
    order_date: data.order_date,
    order_deadline: data.order_deadline || undefined,
    vendor_id: data.vendor_id || undefined,
    warehouse_id: data.warehouse_id || undefined,
    payment_terms: data.payment_terms || undefined,
    notes: data.notes || undefined,
    status: data.status,
    subtotal,
    tax_amount: taxAmount,
    total,
    created_by: session.userId!,
    lines: data.lines.map((l, i) => ({
      product_id: l.product_id || undefined,
      description: l.description || undefined,
      quantity: Number(l.quantity),
      uom: l.uom || undefined,
      unit_price: Number(l.unit_price),
      tax_rate: Number(l.tax_rate),
      subtotal: Number(l.subtotal),
      sort_order: i,
    })),
  })

  revalidatePath("/purchase")
  return order
}

export async function updatePurchaseOrderAction(id: string, input: PurchaseOrderInput) {
  const session = await requireTenantSession()
  const data = purchaseOrderSchema.parse(input)

  const subtotal = data.lines.reduce((s, l) => s + (Number(l.subtotal) || 0), 0)
  const taxAmount = data.lines.reduce((s, l) => {
    const base = Number(l.quantity) * Number(l.unit_price)
    return s + base * ((Number(l.tax_rate) || 0) / 100)
  }, 0)
  const total = subtotal + taxAmount

  await updatePurchaseOrder(id, session.companyId!, {
    order_date: data.order_date,
    order_deadline: data.order_deadline || undefined,
    vendor_id: data.vendor_id || undefined,
    warehouse_id: data.warehouse_id || undefined,
    payment_terms: data.payment_terms || undefined,
    notes: data.notes || undefined,
    status: data.status,
    subtotal,
    tax_amount: taxAmount,
    total,
    lines: data.lines.map((l, i) => ({
      product_id: l.product_id || undefined,
      description: l.description || undefined,
      quantity: Number(l.quantity),
      uom: l.uom || undefined,
      unit_price: Number(l.unit_price),
      tax_rate: Number(l.tax_rate),
      subtotal: Number(l.subtotal),
      sort_order: i,
    })),
  })

  revalidatePath("/purchase")
  revalidatePath(`/purchase/${id}`)
}

export async function updatePurchaseOrderStatusAction(id: string, status: string) {
  const session = await requireTenantSession()
  await updatePurchaseOrderStatus(id, session.companyId!, status)
  revalidatePath("/purchase")
  revalidatePath(`/purchase/${id}`)
}

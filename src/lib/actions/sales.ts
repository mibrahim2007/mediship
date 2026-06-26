"use server"
import { requireTenantSession } from "@/lib/auth/session"
import {
  createSalesOrder,
  updateSalesOrder,
  updateSalesOrderStatus,
  getNextOrderNo,
} from "@/lib/db/sales"
import { salesOrderSchema, type SalesOrderInput } from "@/lib/validations/sales"
import { revalidatePath } from "next/cache"

export async function createSalesOrderAction(input: SalesOrderInput) {
  const session = await requireTenantSession()
  const data = salesOrderSchema.parse(input)

  const orderNo = await getNextOrderNo(session.companyId!)

  const subtotal = data.lines.reduce((s, l) => s + l.subtotal, 0)
  const taxAmount = data.lines.reduce((s, l) => {
    const lineBase = l.unit_price * l.quantity * (1 - l.discount / 100)
    return s + lineBase * (l.tax_rate / 100)
  }, 0)
  const total = subtotal + taxAmount

  const order = await createSalesOrder({
    company_id: session.companyId!,
    order_no: orderNo,
    order_date: data.order_date,
    expiry_date: data.expiry_date || undefined,
    customer_id: data.customer_id || undefined,
    warehouse_id: data.warehouse_id || undefined,
    payment_terms: data.payment_terms || undefined,
    notes: data.notes || undefined,
    status: data.status,
    subtotal,
    tax_amount: taxAmount,
    total,
    created_by: session.userId,
    lines: data.lines.map((l, i) => ({
      ...l,
      product_id: l.product_id || undefined,
      sort_order: i,
    })),
  })

  revalidatePath("/sales")
  return order
}

export async function updateSalesOrderAction(id: string, input: SalesOrderInput) {
  const session = await requireTenantSession()
  const data = salesOrderSchema.parse(input)

  const subtotal = data.lines.reduce((s, l) => s + l.subtotal, 0)
  const taxAmount = data.lines.reduce((s, l) => {
    const lineBase = l.unit_price * l.quantity * (1 - l.discount / 100)
    return s + lineBase * (l.tax_rate / 100)
  }, 0)
  const total = subtotal + taxAmount

  await updateSalesOrder(id, session.companyId!, {
    order_date: data.order_date,
    expiry_date: data.expiry_date || undefined,
    customer_id: data.customer_id || undefined,
    warehouse_id: data.warehouse_id || undefined,
    payment_terms: data.payment_terms || undefined,
    notes: data.notes || undefined,
    status: data.status,
    subtotal,
    tax_amount: taxAmount,
    total,
    lines: data.lines.map((l, i) => ({
      ...l,
      product_id: l.product_id || undefined,
      sort_order: i,
    })),
  })

  revalidatePath("/sales")
  revalidatePath(`/sales/${id}`)
}

export async function updateSalesOrderStatusAction(
  id: string,
  status: "quotation" | "sales_order" | "to_invoice" | "invoiced" | "cancelled"
) {
  const session = await requireTenantSession()
  await updateSalesOrderStatus(id, session.companyId!, status)
  revalidatePath("/sales")
  revalidatePath(`/sales/${id}`)
}

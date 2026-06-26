import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getPurchaseOrders(companyId: string) {
  const { data } = await supabaseAdmin
    .from("purchase_orders")
    .select("id, order_no, order_date, status, total, vendor:contacts!vendor_id(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getPurchaseOrderById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("purchase_orders")
    .select("*, vendor:contacts!vendor_id(id, name, phone, email, address)")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  if (!data) return null

  const { data: lines } = await supabaseAdmin
    .from("purchase_order_lines")
    .select("*, products(name, uom)")
    .eq("order_id", id)
    .order("sort_order")

  return { ...data, lines: lines ?? [] }
}

export async function createPurchaseOrder(payload: {
  company_id: string
  order_no: string
  order_date: string
  order_deadline?: string
  vendor_id?: string
  warehouse_id?: string
  payment_terms?: string
  notes?: string
  status: string
  subtotal: number
  tax_amount: number
  total: number
  created_by: string
  lines: Array<{
    product_id?: string
    description?: string
    quantity: number
    uom?: string
    unit_price: number
    tax_rate: number
    subtotal: number
    sort_order: number
  }>
}) {
  const { lines, ...header } = payload
  const { data: order, error } = await supabaseAdmin
    .from("purchase_orders")
    .insert(header)
    .select()
    .single()
  if (error) throw error

  if (lines.length > 0) {
    const { error: lineError } = await supabaseAdmin
      .from("purchase_order_lines")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })))
    if (lineError) throw lineError
  }

  return order
}

export async function updatePurchaseOrderStatus(
  id: string,
  companyId: string,
  status: string
) {
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function getNextPoNo(companyId: string) {
  const { count } = await supabaseAdmin
    .from("purchase_orders")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
  const seq = String((count ?? 0) + 1).padStart(4, "0")
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `PO-${yy}${mm}-${seq}`
}

export async function getVendors(companyId: string) {
  const { data } = await supabaseAdmin
    .from("contacts")
    .select("id, name, phone, email, payment_terms")
    .eq("company_id", companyId)
    .eq("type", "vendor")
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function getPurchaseProducts(companyId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, uom, cost_price, tax_rate, internal_ref")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export { getWarehouses } from "@/lib/db/sales"

export async function updatePurchaseOrder(
  id: string,
  companyId: string,
  payload: {
    order_date: string
    order_deadline?: string
    vendor_id?: string
    warehouse_id?: string
    payment_terms?: string
    notes?: string
    status: string
    subtotal: number
    tax_amount: number
    total: number
    lines: Array<{
      product_id?: string
      description?: string
      quantity: number
      uom?: string
      unit_price: number
      tax_rate: number
      subtotal: number
      sort_order: number
    }>
  }
) {
  const { lines, ...header } = payload
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({ ...header, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error

  await supabaseAdmin.from("purchase_order_lines").delete().eq("order_id", id)

  if (lines.length > 0) {
    const { error: lineError } = await supabaseAdmin
      .from("purchase_order_lines")
      .insert(lines.map((l) => ({ ...l, order_id: id })))
    if (lineError) throw lineError
  }
}

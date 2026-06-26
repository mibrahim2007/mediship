import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getSalesOrders(companyId: string) {
  const { data } = await supabaseAdmin
    .from("sales_orders")
    .select("id, order_no, order_date, status, total, customer_id, contacts(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getSalesOrderById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("sales_orders")
    .select("*, contacts(id, name, phone, email, address)")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  if (!data) return null

  const { data: lines } = await supabaseAdmin
    .from("sales_order_lines")
    .select("*, products(name, uom)")
    .eq("order_id", id)
    .order("sort_order")

  return { ...data, lines: lines ?? [] }
}

export async function createSalesOrder(payload: {
  company_id: string
  order_no: string
  order_date: string
  expiry_date?: string
  customer_id?: string
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
    discount: number
    tax_rate: number
    subtotal: number
    sort_order: number
  }>
}) {
  const { lines, ...header } = payload
  const { data: order, error } = await supabaseAdmin
    .from("sales_orders")
    .insert(header)
    .select()
    .single()
  if (error) throw error

  if (lines.length > 0) {
    const { error: lineError } = await supabaseAdmin
      .from("sales_order_lines")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })))
    if (lineError) throw lineError
  }

  return order
}

export async function updateSalesOrderStatus(
  id: string,
  companyId: string,
  status: string
) {
  const { error } = await supabaseAdmin
    .from("sales_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function getNextOrderNo(companyId: string) {
  const { count } = await supabaseAdmin
    .from("sales_orders")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
  const seq = String((count ?? 0) + 1).padStart(4, "0")
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `SO-${yy}${mm}-${seq}`
}

export async function getCustomers(companyId: string) {
  const { data } = await supabaseAdmin
    .from("contacts")
    .select("id, name, phone, email, payment_terms")
    .eq("company_id", companyId)
    .eq("type", "customer")
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function getWarehouses(companyId: string) {
  const { data } = await supabaseAdmin
    .from("warehouses")
    .select("id, name, code")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function getProducts(companyId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, uom, sales_price, tax_rate, internal_ref")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function updateSalesOrder(
  id: string,
  companyId: string,
  payload: {
    order_date: string
    expiry_date?: string
    customer_id?: string
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
      discount: number
      tax_rate: number
      subtotal: number
      sort_order: number
    }>
  }
) {
  const { lines, ...header } = payload
  const { error } = await supabaseAdmin
    .from("sales_orders")
    .update({ ...header, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error

  await supabaseAdmin.from("sales_order_lines").delete().eq("order_id", id)

  if (lines.length > 0) {
    const { error: lineError } = await supabaseAdmin
      .from("sales_order_lines")
      .insert(lines.map((l) => ({ ...l, order_id: id })))
    if (lineError) throw lineError
  }
}

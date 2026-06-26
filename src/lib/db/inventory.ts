import { supabaseAdmin } from "@/lib/supabase/admin"

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(companyId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, internal_ref, category, uom, cost_price, sales_price, reorder_point, reorder_qty, is_active, created_at")
    .eq("company_id", companyId)
    .order("name")
  return data ?? []
}

export async function getProductById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  return data
}

export async function createProduct(payload: {
  company_id: string
  name: string
  internal_ref?: string
  category?: string
  uom: string
  cost_price: number
  sales_price: number
  tax_rate: number
  reorder_point: number
  reorder_qty: number
}) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  companyId: string,
  payload: Partial<{
    name: string
    internal_ref: string
    category: string
    uom: string
    cost_price: number
    sales_price: number
    tax_rate: number
    reorder_point: number
    reorder_qty: number
    is_active: boolean
  }>
) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update(payload)
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Stock levels ──────────────────────────────────────────────────────────────
// Convention: from_location = null → external inflow; to_location = null → external outflow
// Internal stock = SUM(qty | to_location IS NOT NULL) – SUM(qty | from_location IS NOT NULL)

export async function getStockLevels(companyId: string): Promise<Record<string, number>> {
  const { data } = await supabaseAdmin
    .from("stock_moves")
    .select("product_id, quantity, to_location, from_location")
    .eq("company_id", companyId)
    .eq("state", "done")
  if (!data) return {}

  const levels: Record<string, number> = {}
  for (const m of data) {
    const id = m.product_id
    if (!id) continue
    if (!levels[id]) levels[id] = 0
    if (m.to_location)   levels[id] += Number(m.quantity)
    if (m.from_location) levels[id] -= Number(m.quantity)
  }
  return levels
}

// ── Stock moves ───────────────────────────────────────────────────────────────

export async function getStockMovesByProduct(productId: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("stock_moves")
    .select("id, reference, move_date, quantity, uom, unit_cost, total_cost, source_type, source_doc, state, to_location, from_location")
    .eq("product_id", productId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50)
  return data ?? []
}

export async function createStockAdjustment(payload: {
  company_id: string
  product_id: string
  direction: "in" | "out"
  quantity: number
  unit_cost: number
  reference: string
  move_date: string
  location_id: string
  created_by: string
  notes?: string
}) {
  const { direction, location_id, notes, ...rest } = payload
  const { data, error } = await supabaseAdmin
    .from("stock_moves")
    .insert({
      company_id:   rest.company_id,
      product_id:   rest.product_id,
      quantity:     rest.quantity,
      unit_cost:    rest.unit_cost,
      total_cost:   rest.quantity * rest.unit_cost,
      reference:    rest.reference,
      move_date:    rest.move_date,
      source_type:  "adjustment",
      source_doc:   notes ?? null,
      to_location:   direction === "in"  ? location_id : null,
      from_location: direction === "out" ? location_id : null,
      state:        "done",
      created_by:   rest.created_by,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Warehouses & locations ────────────────────────────────────────────────────

export async function getWarehouses(companyId: string) {
  const { data } = await supabaseAdmin
    .from("warehouses")
    .select("id, name, code, address, is_active, created_at")
    .eq("company_id", companyId)
    .order("name")
  return data ?? []
}

export async function getOrCreateDefaultLocation(companyId: string): Promise<string> {
  // Ensure a warehouse exists
  let { data: warehouses } = await supabaseAdmin
    .from("warehouses")
    .select("id")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .limit(1)

  let warehouseId: string
  if (!warehouses?.length) {
    const { data: wh, error } = await supabaseAdmin
      .from("warehouses")
      .insert({ company_id: companyId, name: "Main Warehouse", code: "WH01" })
      .select("id")
      .single()
    if (error) throw error
    warehouseId = wh.id
  } else {
    warehouseId = warehouses[0].id
  }

  // Ensure a stock location exists for that warehouse
  let { data: locations } = await supabaseAdmin
    .from("stock_locations")
    .select("id")
    .eq("warehouse_id", warehouseId)
    .eq("is_active", true)
    .limit(1)

  if (!locations?.length) {
    const { data: loc, error } = await supabaseAdmin
      .from("stock_locations")
      .insert({ warehouse_id: warehouseId, name: "Stock", location_type: "internal" })
      .select("id")
      .single()
    if (error) throw error
    return loc.id
  }
  return locations[0].id
}

import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getAllCompanies() {
  const { data } = await supabaseAdmin
    .from("companies")
    .select(`
      *,
      subscriptions (
        id, status, billing_cycle, trial_ends_at, current_period_end,
        plans ( id, display_name, price_monthly )
      )
    `)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getCompanyById(id: string) {
  const { data } = await supabaseAdmin
    .from("companies")
    .select(`
      *,
      subscriptions (
        *, plans (*)
      )
    `)
    .eq("id", id)
    .single()
  return data
}

export async function createCompany(payload: {
  name: string
  email?: string
  phone?: string
  address?: string
  tax_reg_no?: string
  currency?: string
}) {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({ ...payload, status: "active" })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCompanyStatus(id: string, status: "active" | "suspended" | "cancelled") {
  const { error } = await supabaseAdmin
    .from("companies")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}

export async function getCompanyStats(id: string) {
  const [usersResult, warehousesResult, productsResult] = await Promise.all([
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("company_id", id),
    supabaseAdmin.from("warehouses").select("id", { count: "exact", head: true }).eq("company_id", id),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("company_id", id),
  ])
  return {
    users: usersResult.count ?? 0,
    warehouses: warehousesResult.count ?? 0,
    products: productsResult.count ?? 0,
  }
}

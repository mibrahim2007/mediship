import { supabaseAdmin } from "@/lib/supabase/admin"

export async function listPlans() {
  const { data } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  return data ?? []
}

export async function getAllPlans() {
  const { data } = await supabaseAdmin
    .from("plans")
    .select("*")
    .order("sort_order")
  return data ?? []
}

export async function getPlanById(id: string) {
  const { data } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function upsertPlan(payload: {
  id?: string
  name: string
  display_name: string
  price_monthly: number
  price_yearly: number
  max_users: number
  max_warehouses: number
  max_products: number
  features: Record<string, boolean>
  sort_order?: number
  is_active?: boolean
}) {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .upsert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

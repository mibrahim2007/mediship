import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getSubscriptionByCompany(companyId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getAllSubscriptions() {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select(`*, companies(id, name, email), plans(id, display_name)`)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function createSubscription(payload: {
  company_id: string
  plan_id: string
  status?: string
  billing_cycle?: string
  trial_ends_at?: string
}) {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .insert({
      ...payload,
      status: payload.status ?? "trialing",
      billing_cycle: payload.billing_cycle ?? "monthly",
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSubscriptionStatus(
  id: string,
  status: string,
  extra?: { cancelled_at?: string; current_period_end?: string }
) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq("id", id)
  if (error) throw error
}

export async function changeSubscriptionPlan(id: string, planId: string) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ plan_id: planId, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

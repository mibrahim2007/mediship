import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getUserByIdentifier(identifier: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .eq("is_active", true)
    .single()
  return data
}

export async function getUserById(id: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function updateLastLogin(id: string) {
  await supabaseAdmin
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", id)
}

export async function getUsersByCompany(companyId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, username, email, full_name, role, avatar_url, is_active, last_login_at, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function createUser(payload: {
  company_id: string
  username: string
  email: string
  password_hash: string
  full_name?: string
  role: string
}) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getLeads(companyId: string) {
  const { data } = await supabaseAdmin
    .from("crm_leads")
    .select("id, name, stage, priority, company_name, contact_name, phone, email, expected_revenue, probability, expected_closing, source, created_at, contact_id, contacts!contact_id(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getLeadById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("crm_leads")
    .select("*, contacts!contact_id(id, name, phone, email, company_name)")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  return data
}

export async function createLead(payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("crm_leads")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLead(id: string, companyId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("crm_leads")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLeadStage(id: string, companyId: string, stage: string, lostReason?: string) {
  const patch: Record<string, unknown> = { stage, updated_at: new Date().toISOString() }
  if (stage === "won")  patch.probability = 100
  if (stage === "lost") { patch.probability = 0; if (lostReason) patch.lost_reason = lostReason }
  const { error } = await supabaseAdmin
    .from("crm_leads")
    .update(patch)
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

// Contacts
export async function getContacts(companyId: string, type?: string) {
  let q = supabaseAdmin
    .from("contacts")
    .select("id, name, type, company_name, email, phone, city, is_active, created_at")
    .eq("company_id", companyId)
    .order("name")
  if (type) q = q.eq("type", type)
  const { data } = await q
  return data ?? []
}

export async function getContactById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  return data
}

export async function createContact(payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateContact(id: string, companyId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getContactsForSelect(companyId: string) {
  const { data } = await supabaseAdmin
    .from("contacts")
    .select("id, name, company_name")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

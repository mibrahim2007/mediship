import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getJournalEntries(companyId: string) {
  const { data } = await supabaseAdmin
    .from("journal_entries")
    .select("*")
    .eq("company_id", companyId)
    .order("entry_date", { ascending: false })
  return data ?? []
}

export async function getJournalEntryById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  if (!data) return null

  const { data: lines } = await supabaseAdmin
    .from("journal_entry_lines")
    .select("*, accounts(code, name)")
    .eq("entry_id", id)
    .order("sort_order")

  return { ...data, lines: lines ?? [] }
}

export async function getAccounts(companyId: string) {
  const { data } = await supabaseAdmin
    .from("accounts")
    .select("id, code, name, account_type, is_active")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("code")
  return data ?? []
}

export async function getNextEntryNo(companyId: string) {
  const { count } = await supabaseAdmin
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
  const seq = String((count ?? 0) + 1).padStart(4, "0")
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `JE-${yy}${mm}-${seq}`
}

export async function createJournalEntry(payload: {
  company_id: string
  entry_no: string
  entry_date: string
  journal_type: string
  voucher_type: string
  reference?: string
  narration?: string
  status: string
  total_debit: number
  total_credit: number
  created_by: string
  lines: Array<{
    account_id: string
    description?: string
    debit: number
    credit: number
    sort_order: number
  }>
}) {
  const { lines, ...header } = payload
  const { data: entry, error } = await supabaseAdmin
    .from("journal_entries")
    .insert(header)
    .select()
    .single()
  if (error) throw error

  if (lines.length > 0) {
    const { error: lineError } = await supabaseAdmin
      .from("journal_entry_lines")
      .insert(lines.map((l) => ({ ...l, entry_id: entry.id })))
    if (lineError) throw lineError
  }
  return entry
}

export async function postJournalEntry(id: string, companyId: string) {
  const { error } = await supabaseAdmin
    .from("journal_entries")
    .update({ status: "posted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function cancelJournalEntry(id: string, companyId: string) {
  const { error } = await supabaseAdmin
    .from("journal_entries")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function createAccount(payload: {
  company_id: string
  code: string
  name: string
  account_type: string
  parent_id?: string
}) {
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .insert({ ...payload, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data
}

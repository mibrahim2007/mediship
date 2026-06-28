import { supabaseAdmin } from "@/lib/supabase/admin"

// ─── Areas ───────────────────────────────────────────────────────────────────

export async function getAreas(companyId: string) {
  const { data } = await supabaseAdmin
    .from("sale_areas")
    .select("id, name, code, city, region, description, is_active, created_at")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name")
  return data ?? []
}

export async function getAllAreas(companyId: string) {
  const { data } = await supabaseAdmin
    .from("sale_areas")
    .select(`
      id, name, code, city, region, description, is_active, created_at,
      sale_teams(id)
    `)
    .eq("company_id", companyId)
    .order("name")
  return data ?? []
}

export async function getAreaById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("sale_areas")
    .select("id, name, code, city, region, description, is_active")
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  return data ?? null
}

export async function updateArea(id: string, companyId: string, payload: {
  name: string
  code?: string
  city?: string
  region?: string
  description?: string
}) {
  const { error } = await supabaseAdmin
    .from("sale_areas")
    .update(payload)
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function deleteArea(id: string, companyId: string) {
  const { error } = await supabaseAdmin
    .from("sale_areas")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function createArea(payload: {
  company_id: string
  name: string
  code?: string
  city?: string
  region?: string
  description?: string
}) {
  const { data, error } = await supabaseAdmin
    .from("sale_areas")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function getTeams(companyId: string) {
  const { data } = await supabaseAdmin
    .from("sale_teams")
    .select(`
      id, name, target_amount, is_active, created_at, notes,
      sale_areas(id, name, city, region),
      users!sale_teams_team_lead_id_fkey(id, full_name),
      sale_team_members(id, user_id, users(id, full_name, role))
    `)
    .eq("company_id", companyId)
    .order("name")
  return data ?? []
}

export async function getTeamById(id: string, companyId: string) {
  const { data } = await supabaseAdmin
    .from("sale_teams")
    .select(`
      id, name, target_amount, is_active, notes, created_at, updated_at,
      area_id, team_lead_id,
      sale_areas(id, name, code, city, region),
      users!sale_teams_team_lead_id_fkey(id, full_name),
      sale_team_members(id, user_id, users(id, full_name, role, email)),
      sale_team_products(id, product_id, target_qty, assigned_at, products(id, name, uom, internal_ref, category))
    `)
    .eq("id", id)
    .eq("company_id", companyId)
    .single()
  return data ?? null
}

export async function createTeam(payload: {
  company_id: string
  name: string
  area_id?: string
  team_lead_id?: string
  target_amount: number
  notes?: string
  created_by: string
}) {
  const { data, error } = await supabaseAdmin
    .from("sale_teams")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTeam(id: string, companyId: string, payload: {
  name: string
  area_id?: string
  team_lead_id?: string
  target_amount: number
  notes?: string
}) {
  const { error } = await supabaseAdmin
    .from("sale_teams")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

export async function deleteTeam(id: string, companyId: string) {
  const { error } = await supabaseAdmin
    .from("sale_teams")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId)
  if (error) throw error
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function addTeamMember(teamId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("sale_team_members")
    .insert({ team_id: teamId, user_id: userId })
  if (error) throw error
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("sale_team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId)
  if (error) throw error
}

export async function getTeamMemberCount(teamId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("sale_team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId)
  return count ?? 0
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function addTeamProduct(teamId: string, productId: string, targetQty: number) {
  const { error } = await supabaseAdmin
    .from("sale_team_products")
    .insert({ team_id: teamId, product_id: productId, target_qty: targetQty })
  if (error) throw error
}

export async function removeTeamProduct(teamId: string, productId: string) {
  const { error } = await supabaseAdmin
    .from("sale_team_products")
    .delete()
    .eq("team_id", teamId)
    .eq("product_id", productId)
  if (error) throw error
}

// ─── Comparison data ──────────────────────────────────────────────────────────

export async function getTeamSalesComparison(companyId: string) {
  // Get all teams with members
  const { data: teams } = await supabaseAdmin
    .from("sale_teams")
    .select(`
      id, name, target_amount,
      sale_areas(id, name, city, region),
      sale_team_members(user_id)
    `)
    .eq("company_id", companyId)
    .eq("is_active", true)

  if (!teams?.length) return { teamStats: [], areaStats: [] }

  // Collect all salesperson IDs
  const allUserIds = teams.flatMap((t: any) => t.sale_team_members.map((m: any) => m.user_id))
  const uniqueUserIds = allUserIds.filter((id, i, arr) => arr.indexOf(id) === i)

  // Get sales per salesperson
  const { data: salesRows } = await supabaseAdmin
    .from("sales_orders")
    .select("salesperson_id, total, status")
    .eq("company_id", companyId)
    .in("salesperson_id", uniqueUserIds.length ? uniqueUserIds : ["00000000-0000-0000-0000-000000000000"])
    .neq("status", "cancelled")

  const salesByUser: Record<string, number> = {}
  for (const row of salesRows ?? []) {
    if (!row.salesperson_id) continue
    salesByUser[row.salesperson_id] = (salesByUser[row.salesperson_id] ?? 0) + Number(row.total ?? 0)
  }

  // Compute team stats
  const teamStats = teams.map((t: any) => {
    const memberIds: string[] = t.sale_team_members.map((m: any) => m.user_id)
    const sales = memberIds.reduce((s: number, uid: string) => s + (salesByUser[uid] ?? 0), 0)
    return {
      id: t.id,
      name: t.name,
      area: t.sale_areas?.name ?? "—",
      city: t.sale_areas?.city ?? "",
      target: Number(t.target_amount ?? 0),
      sales,
      achievement: t.target_amount > 0 ? Math.round((sales / t.target_amount) * 100) : null,
    }
  })

  // Compute area stats
  const areaMap: Record<string, { name: string; city: string; sales: number; target: number; teams: number }> = {}
  for (const t of teams as any[]) {
    const areaId = t.sale_areas?.id ?? "unassigned"
    const areaName = t.sale_areas?.name ?? "Unassigned"
    const areaCity = t.sale_areas?.city ?? ""
    if (!areaMap[areaId]) {
      areaMap[areaId] = { name: areaName, city: areaCity, sales: 0, target: 0, teams: 0 }
    }
    const memberIds: string[] = t.sale_team_members.map((m: any) => m.user_id)
    const sales = memberIds.reduce((s: number, uid: string) => s + (salesByUser[uid] ?? 0), 0)
    areaMap[areaId].sales += sales
    areaMap[areaId].target += Number(t.target_amount ?? 0)
    areaMap[areaId].teams += 1
  }

  const areaStats = Object.values(areaMap)

  return { teamStats, areaStats }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getSalesReps(companyId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, full_name, role, email")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .in("role", ["sales_manager", "sales_rep"])
    .order("full_name")
  return data ?? []
}

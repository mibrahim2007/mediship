"use server"
import { requireTenantSession } from "@/lib/auth/session"
import {
  createTeam, updateTeam, deleteTeam,
  addTeamMember, removeTeamMember, getTeamMemberCount,
  addTeamProduct, removeTeamProduct,
  createArea, updateArea, deleteArea,
} from "@/lib/db/teams"
import {
  teamSchema, areaSchema, addMemberSchema, addProductSchema,
  type TeamInput, type AreaInput, type AddMemberInput, type AddProductInput,
} from "@/lib/validations/teams"
import { revalidatePath } from "next/cache"

export async function createTeamAction(input: TeamInput) {
  const session = await requireTenantSession()
  const data = teamSchema.parse(input)
  const team = await createTeam({
    company_id:    session.companyId!,
    name:          data.name,
    area_id:       data.area_id || undefined,
    team_lead_id:  data.team_lead_id || undefined,
    target_amount: data.target_amount,
    notes:         data.notes || undefined,
    created_by:    session.userId,
  })
  revalidatePath("/sales/teams")
  return team
}

export async function updateTeamAction(id: string, input: TeamInput) {
  const session = await requireTenantSession()
  const data = teamSchema.parse(input)
  await updateTeam(id, session.companyId!, {
    name:          data.name,
    area_id:       data.area_id || undefined,
    team_lead_id:  data.team_lead_id || undefined,
    target_amount: data.target_amount,
    notes:         data.notes || undefined,
  })
  revalidatePath("/sales/teams")
  revalidatePath(`/sales/teams/${id}`)
}

export async function deleteTeamAction(id: string) {
  const session = await requireTenantSession()
  await deleteTeam(id, session.companyId!)
  revalidatePath("/sales/teams")
}

export async function addTeamMemberAction(teamId: string, input: AddMemberInput) {
  await requireTenantSession()
  const data = addMemberSchema.parse(input)
  const count = await getTeamMemberCount(teamId)
  if (count >= 4) throw new Error("A team can have a maximum of 4 members")
  await addTeamMember(teamId, data.user_id)
  revalidatePath(`/sales/teams/${teamId}`)
}

export async function removeTeamMemberAction(teamId: string, userId: string) {
  await requireTenantSession()
  await removeTeamMember(teamId, userId)
  revalidatePath(`/sales/teams/${teamId}`)
}

export async function addTeamProductAction(teamId: string, input: AddProductInput) {
  await requireTenantSession()
  const data = addProductSchema.parse(input)
  await addTeamProduct(teamId, data.product_id, data.target_qty)
  revalidatePath(`/sales/teams/${teamId}`)
}

export async function removeTeamProductAction(teamId: string, productId: string) {
  await requireTenantSession()
  await removeTeamProduct(teamId, productId)
  revalidatePath(`/sales/teams/${teamId}`)
}

export async function createAreaAction(input: AreaInput) {
  const session = await requireTenantSession()
  const data = areaSchema.parse(input)
  const area = await createArea({
    company_id:  session.companyId!,
    name:        data.name,
    code:        data.code || undefined,
    city:        data.city || undefined,
    region:      data.region || undefined,
    description: data.description || undefined,
  })
  revalidatePath("/sales/areas")
  revalidatePath("/sales/teams")
  return area
}

export async function updateAreaAction(id: string, input: AreaInput) {
  const session = await requireTenantSession()
  const data = areaSchema.parse(input)
  await updateArea(id, session.companyId!, {
    name:        data.name,
    code:        data.code || undefined,
    city:        data.city || undefined,
    region:      data.region || undefined,
    description: data.description || undefined,
  })
  revalidatePath("/sales/areas")
  revalidatePath("/sales/teams")
}

export async function deleteAreaAction(id: string) {
  const session = await requireTenantSession()
  await deleteArea(id, session.companyId!)
  revalidatePath("/sales/areas")
  revalidatePath("/sales/teams")
}

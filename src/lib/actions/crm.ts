"use server"

import { requireTenantSession } from "@/lib/auth/session"
import { leadSchema, contactSchema } from "@/lib/validations/crm"
import { createLead, updateLead, updateLeadStage, createContact, updateContact } from "@/lib/db/crm"
import { revalidatePath } from "next/cache"

export async function createLeadAction(input: unknown) {
  const session = await requireTenantSession()
  const data = leadSchema.parse(input)
  const lead = await createLead({
    ...data,
    contact_id: data.contact_id || null,
    company_id: session.companyId,
    created_by: session.userId,
  })
  revalidatePath("/crm")
  return lead
}

export async function updateLeadAction(id: string, input: unknown) {
  const session = await requireTenantSession()
  const data = leadSchema.parse(input)
  const lead = await updateLead(id, session.companyId!, {
    ...data,
    contact_id: data.contact_id || null,
  })
  revalidatePath("/crm")
  revalidatePath(`/crm/leads/${id}`)
  return lead
}

export async function updateLeadStageAction(id: string, stage: string, lostReason?: string) {
  const session = await requireTenantSession()
  await updateLeadStage(id, session.companyId!, stage, lostReason)
  revalidatePath("/crm")
  revalidatePath(`/crm/leads/${id}`)
}

export async function createContactAction(input: unknown) {
  const session = await requireTenantSession()
  const data = contactSchema.parse(input)
  const contact = await createContact({ ...data, company_id: session.companyId })
  revalidatePath("/crm/contacts")
  return contact
}

export async function updateContactAction(id: string, input: unknown) {
  const session = await requireTenantSession()
  const data = contactSchema.parse(input)
  const contact = await updateContact(id, session.companyId!, data)
  revalidatePath("/crm/contacts")
  revalidatePath(`/crm/contacts/${id}`)
  return contact
}

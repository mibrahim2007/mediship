"use server"
import { requirePlatformSession } from "@/lib/auth/session"
import { createCompany, updateCompanyStatus } from "@/lib/db/companies"
import { createSubscription, changeSubscriptionPlan, updateSubscriptionStatus } from "@/lib/db/subscriptions"
import { upsertPlan } from "@/lib/db/plans"
import { createUser } from "@/lib/db/users"
import { hashPassword } from "@/lib/auth/password"
import { onboardCompanySchema, type OnboardCompanyInput } from "@/lib/validations/company"
import type { PlanInput } from "@/lib/validations/plan"
import { revalidatePath } from "next/cache"

export async function onboardCompanyAction(input: OnboardCompanyInput) {
  await requirePlatformSession()
  const data = onboardCompanySchema.parse(input)

  const company = await createCompany({
    name: data.name,
    email: data.email || undefined,
    phone: data.phone,
    address: data.address,
    tax_reg_no: data.tax_reg_no,
    currency: data.currency,
  })

  const [passwordHash, subscription] = await Promise.all([
    hashPassword(data.admin_password),
    createSubscription({
      company_id: company.id,
      plan_id: data.plan_id,
      billing_cycle: data.billing_cycle,
      status: "trialing",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  ])

  await createUser({
    company_id: company.id,
    username: data.admin_username,
    email: data.admin_email,
    password_hash: passwordHash,
    full_name: data.admin_full_name,
    role: "super_admin",
  })

  revalidatePath("/admin/companies")
  return { company, subscription }
}

export async function suspendCompanyAction(id: string) {
  await requirePlatformSession()
  await updateCompanyStatus(id, "suspended")
  revalidatePath("/admin/companies")
}

export async function activateCompanyAction(id: string) {
  await requirePlatformSession()
  await updateCompanyStatus(id, "active")
  revalidatePath("/admin/companies")
}

export async function upsertPlanAction(input: PlanInput & { id?: string }) {
  await requirePlatformSession()
  const plan = await upsertPlan(input)
  revalidatePath("/admin/plans")
  return plan
}

export async function changeSubscriptionAction(subscriptionId: string, planId: string) {
  await requirePlatformSession()
  await changeSubscriptionPlan(subscriptionId, planId)
  revalidatePath("/admin/subscriptions")
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  await requirePlatformSession()
  await updateSubscriptionStatus(subscriptionId, "cancelled", { cancelled_at: new Date().toISOString() })
  revalidatePath("/admin/subscriptions")
}

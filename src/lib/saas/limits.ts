import { getCompanyStats } from "@/lib/db/companies"
import { getSubscriptionByCompany } from "@/lib/db/subscriptions"

type LimitKey = "users" | "warehouses" | "products"

export async function assertWithinLimit(companyId: string, key: LimitKey) {
  const [sub, stats] = await Promise.all([
    getSubscriptionByCompany(companyId),
    getCompanyStats(companyId),
  ])

  if (!sub?.plans) return // no subscription found — allow (edge case)

  const plan = sub.plans as Record<string, number>
  const limitMap: Record<LimitKey, number> = {
    users: plan.max_users,
    warehouses: plan.max_warehouses,
    products: plan.max_products,
  }

  const limit = limitMap[key]
  if (limit === 0) return // 0 = unlimited (enterprise)

  const current = stats[key]
  if (current >= limit) {
    throw new Error(
      `Plan limit reached: your ${sub.plans.display_name} plan allows ${limit} ${key}. Upgrade to add more.`
    )
  }
}

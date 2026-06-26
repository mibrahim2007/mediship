import { getSubscriptionByCompany } from "@/lib/db/subscriptions"
import type { FeatureFlags } from "@/types/saas"

export async function checkFeatureFlag(companyId: string, flag: keyof FeatureFlags): Promise<boolean> {
  const sub = await getSubscriptionByCompany(companyId)
  if (!sub?.plans) return false
  const features = sub.plans.features as FeatureFlags
  return features?.[flag] ?? false
}

export async function requireFeature(companyId: string, flag: keyof FeatureFlags) {
  const allowed = await checkFeatureFlag(companyId, flag)
  if (!allowed) throw new Error(`Your plan does not include access to this feature. Please upgrade.`)
}

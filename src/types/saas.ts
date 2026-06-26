export interface Plan {
  id: string
  name: string
  display_name: string
  price_monthly: number
  price_yearly: number
  max_users: number
  max_warehouses: number
  max_products: number
  features: FeatureFlags
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface FeatureFlags {
  reports: boolean
  crm: boolean
  multi_warehouse: boolean
  custom_branding?: boolean
  dedicated_support?: boolean
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired"

export interface Subscription {
  id: string
  company_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: "monthly" | "yearly"
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  plan?: Plan
}

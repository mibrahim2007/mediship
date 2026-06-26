export const ROLES = [
  "super_admin",
  "finance_manager",
  "sales_manager",
  "sales_rep",
  "purchase_officer",
  "warehouse_manager",
  "warehouse_staff",
  "crm_agent",
  "view_only",
] as const

export const PLATFORM_ROLES = [
  "platform_super_admin",
  "platform_admin",
  "platform_support",
] as const

export const SEQUENCE_PREFIXES = {
  quotation: "S",
  sales_order: "SO",
  invoice: "INV",
  bill: "BILL",
  purchase_order: "P",
  grn: "GRN",
  jv: "JV",
  cpv: "CPV",
  crv: "CRV",
  bpv: "BPV",
  brv: "BRV",
} as const

export const VOUCHER_TYPES = ["INV", "BILL", "CPV", "CRV", "BPV", "BRV", "JV"] as const

export const SALES_STATUSES = ["quotation", "sales_order", "to_invoice", "invoiced", "cancelled"] as const
export const PURCHASE_STATUSES = ["rfq", "rfq_sent", "purchase_order", "done", "cancelled"] as const
export const JOURNAL_STATUSES = ["draft", "posted", "cancelled"] as const
export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "cancelled", "expired"] as const
export const COMPANY_STATUSES = ["active", "suspended", "cancelled"] as const
export const LEAD_STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const
export const ACTIVITY_TYPES = ["call", "email", "meeting", "follow_up", "todo"] as const

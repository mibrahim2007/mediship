export type PlatformRole = "platform_super_admin" | "platform_admin" | "platform_support"

export type TenantRole =
  | "super_admin"
  | "finance_manager"
  | "sales_manager"
  | "sales_rep"
  | "purchase_officer"
  | "warehouse_manager"
  | "warehouse_staff"
  | "crm_agent"
  | "view_only"

export interface JwtPayload {
  userId: string
  email: string
  fullName: string | null
  role: TenantRole | null
  companyId: string | null
  platformRole: PlatformRole | null
}

export interface LoginCredentials {
  identifier: string // email or username
  password: string
}

export interface Session extends JwtPayload {
  isAdmin: boolean
  isTenant: boolean
}

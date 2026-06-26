import { z } from "zod"

export const planSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_]+$/, "Lowercase letters and underscores only"),
  display_name: z.string().min(1),
  price_monthly: z.coerce.number().min(0),
  price_yearly: z.coerce.number().min(0),
  max_users: z.coerce.number().int().min(1),
  max_warehouses: z.coerce.number().int().min(1),
  max_products: z.coerce.number().int().min(0),
  features: z.object({
    reports: z.boolean().default(false),
    crm: z.boolean().default(false),
    multi_warehouse: z.boolean().default(false),
    custom_branding: z.boolean().default(false),
    dedicated_support: z.boolean().default(false),
  }),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export type PlanInput = z.infer<typeof planSchema>

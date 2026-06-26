import { z } from "zod"

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_reg_no: z.string().optional(),
  currency: z.string().default("PKR"),
})

export const onboardCompanySchema = companySchema.extend({
  plan_id: z.string().uuid("Select a valid plan"),
  billing_cycle: z.enum(["monthly", "yearly"]).default("monthly"),
  admin_username: z.string().min(3, "Username must be at least 3 characters"),
  admin_email: z.string().email("Invalid email"),
  admin_password: z.string().min(8, "Password must be at least 8 characters"),
  admin_full_name: z.string().optional(),
})

export type CompanyInput = z.infer<typeof companySchema>
export type OnboardCompanyInput = z.infer<typeof onboardCompanySchema>

import { z } from "zod"

export const leadSchema = z.object({
  name:             z.string().min(1, "Lead name is required"),
  lead_type:        z.enum(["lead", "opportunity"]),
  stage:            z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]),
  contact_id:       z.string().uuid().optional().or(z.literal("")),
  company_name:     z.string().optional(),
  contact_name:     z.string().optional(),
  phone:            z.string().optional(),
  email:            z.string().email().optional().or(z.literal("")),
  expected_revenue: z.coerce.number().min(0),
  probability:      z.coerce.number().min(0).max(100),
  expected_closing: z.string().optional(),
  priority:         z.enum(["low", "normal", "high"]),
  source:           z.string().optional(),
  sales_team:       z.string().optional(),
  notes:            z.string().optional(),
})
export type LeadInput = z.infer<typeof leadSchema>

export const contactSchema = z.object({
  name:          z.string().min(1, "Name is required"),
  type:          z.enum(["customer", "vendor", "both"]),
  company_name:  z.string().optional(),
  email:         z.string().email().optional().or(z.literal("")),
  phone:         z.string().optional(),
  mobile:        z.string().optional(),
  address:       z.string().optional(),
  city:          z.string().optional(),
  country:       z.string(),
  tax_reg_no:    z.string().optional(),
  credit_limit:  z.coerce.number().min(0),
  payment_terms: z.string().optional(),
})
export type ContactInput = z.infer<typeof contactSchema>

import { z } from "zod"

export const areaSchema = z.object({
  name:        z.string().min(1, "Area name is required"),
  code:        z.string().optional(),
  city:        z.string().optional(),
  region:      z.string().optional(),
  description: z.string().optional(),
})
export type AreaInput = z.infer<typeof areaSchema>

export const teamSchema = z.object({
  name:          z.string().min(1, "Team name is required"),
  area_id:       z.string().uuid().optional().or(z.literal("")),
  team_lead_id:  z.string().uuid().optional().or(z.literal("")),
  target_amount: z.coerce.number().min(0).default(0),
  notes:         z.string().optional(),
})
export type TeamInput = z.infer<typeof teamSchema>

export const addMemberSchema = z.object({
  user_id: z.string().uuid("Please select a valid user"),
})
export type AddMemberInput = z.infer<typeof addMemberSchema>

export const addProductSchema = z.object({
  product_id: z.string().uuid("Please select a valid product"),
  target_qty: z.coerce.number().min(0).default(0),
})
export type AddProductInput = z.infer<typeof addProductSchema>

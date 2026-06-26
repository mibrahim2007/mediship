import { z } from "zod"

export const productSchema = z.object({
  name:          z.string().min(1, "Name is required"),
  internal_ref:  z.string().optional(),
  category:      z.string().optional(),
  uom:           z.string().min(1, "Unit of measure is required"),
  cost_price:    z.coerce.number().min(0).default(0),
  sales_price:   z.coerce.number().min(0).default(0),
  tax_rate:      z.coerce.number().min(0).max(100).default(0),
  reorder_point: z.coerce.number().min(0).default(0),
  reorder_qty:   z.coerce.number().min(0).default(0),
})

export const stockAdjustSchema = z.object({
  product_id: z.string().uuid("Select a product"),
  direction:  z.enum(["in", "out"]),
  quantity:   z.coerce.number().positive("Quantity must be positive"),
  unit_cost:  z.coerce.number().min(0).default(0),
  move_date:  z.string().min(1, "Date is required"),
  reference:  z.string().optional(),
  notes:      z.string().optional(),
})

export type ProductInput      = z.infer<typeof productSchema>
export type StockAdjustInput  = z.infer<typeof stockAdjustSchema>

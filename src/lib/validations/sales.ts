import { z } from "zod"

export const salesOrderLineSchema = z.object({
  product_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  uom: z.string().optional(),
  unit_price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  subtotal: z.coerce.number().min(0),
  sort_order: z.number().default(0),
})

export const salesOrderSchema = z.object({
  order_date: z.string().min(1, "Order date is required"),
  expiry_date: z.string().optional(),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  warehouse_id: z.string().uuid().optional().or(z.literal("")),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["quotation", "sales_order", "to_invoice", "invoiced", "cancelled"]).default("quotation"),
  lines: z.array(salesOrderLineSchema).min(1, "Add at least one line item"),
})

export type SalesOrderInput = z.infer<typeof salesOrderSchema>
export type SalesOrderLineInput = z.infer<typeof salesOrderLineSchema>

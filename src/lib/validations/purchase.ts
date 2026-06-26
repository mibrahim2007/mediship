import { z } from "zod"

export const purchaseOrderLineSchema = z.object({
  product_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  uom: z.string().optional(),
  unit_price: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  subtotal: z.coerce.number().min(0),
  sort_order: z.number().default(0),
})

export const purchaseOrderSchema = z.object({
  order_date: z.string().min(1, "Order date is required"),
  order_deadline: z.string().optional(),
  vendor_id: z.string().uuid().optional().or(z.literal("")),
  warehouse_id: z.string().uuid().optional().or(z.literal("")),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["rfq", "rfq_sent", "purchase_order", "done", "cancelled"]).default("rfq"),
  lines: z.array(purchaseOrderLineSchema).min(1, "At least one line item is required"),
})

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
export type PurchaseOrderLineInput = z.infer<typeof purchaseOrderLineSchema>

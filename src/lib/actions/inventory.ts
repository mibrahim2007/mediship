"use server"

import { requireTenantSession } from "@/lib/auth/session"
import {
  createProduct,
  updateProduct,
  createStockAdjustment,
  getOrCreateDefaultLocation,
} from "@/lib/db/inventory"
import { productSchema, stockAdjustSchema, type ProductInput, type StockAdjustInput } from "@/lib/validations/inventory"
import { revalidatePath } from "next/cache"

export async function createProductAction(input: ProductInput) {
  const session = await requireTenantSession()
  const data = productSchema.parse(input)
  const product = await createProduct({ ...data, company_id: session.companyId! })
  revalidatePath("/stocks")
  return product
}

export async function updateProductAction(id: string, input: Partial<ProductInput>) {
  const session = await requireTenantSession()
  const product = await updateProduct(id, session.companyId!, input)
  revalidatePath("/stocks")
  revalidatePath(`/stocks/products/${id}`)
  return product
}

export async function createStockAdjustmentAction(input: StockAdjustInput) {
  const session = await requireTenantSession()
  const data = stockAdjustSchema.parse(input)

  const locationId = await getOrCreateDefaultLocation(session.companyId!)

  const seq = String(Date.now()).slice(-6)
  const reference = data.reference?.trim() || `ADJ-${seq}`

  const move = await createStockAdjustment({
    company_id: session.companyId!,
    product_id: data.product_id,
    direction:  data.direction,
    quantity:   Number(data.quantity),
    unit_cost:  Number(data.unit_cost),
    reference,
    move_date:  data.move_date,
    location_id: locationId,
    created_by:  session.userId!,
    notes:       data.notes,
  })

  revalidatePath("/stocks")
  revalidatePath(`/stocks/products/${data.product_id}`)
  return move
}

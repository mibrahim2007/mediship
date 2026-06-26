import { requireTenantSession } from "@/lib/auth/session"
import { getVendors, getPurchaseProducts, getWarehouses } from "@/lib/db/purchase"
import { PurchaseOrderForm } from "@/components/app/purchase-order-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewPurchaseOrderPage() {
  const session = await requireTenantSession()
  const [vendors, products, warehouses] = await Promise.all([
    getVendors(session.companyId!),
    getPurchaseProducts(session.companyId!),
    getWarehouses(session.companyId!),
  ])

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Purchase Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create an RFQ or confirmed purchase order</p>
        </div>
      </div>

      <PurchaseOrderForm
        vendors={vendors}
        warehouses={warehouses}
        products={products}
      />
    </div>
  )
}

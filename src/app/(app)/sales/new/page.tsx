import { requireTenantSession } from "@/lib/auth/session"
import { getCustomers, getWarehouses, getProducts } from "@/lib/db/sales"
import { SalesOrderForm } from "@/components/app/sales-order-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewSalesOrderPage() {
  const session = await requireTenantSession()
  const [customers, warehouses, products] = await Promise.all([
    getCustomers(session.companyId!),
    getWarehouses(session.companyId!),
    getProducts(session.companyId!),
  ])

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Sales Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a quotation or confirmed order</p>
        </div>
      </div>

      <SalesOrderForm
        customers={customers}
        warehouses={warehouses}
        products={products}
      />
    </div>
  )
}

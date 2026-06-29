import { requireTenantSession } from "@/lib/auth/session"
import { getSalesOrders } from "@/lib/db/sales"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import SalesOrdersList from "@/components/app/sales-orders-list"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const session = await requireTenantSession()
  const orders = await getSalesOrders(session.companyId!)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} orders</p>
        </div>
        <Link href="/sales/new">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-1" /> New Order
          </Button>
        </Link>
      </div>

      <SalesOrdersList initialOrders={orders as any} />
    </div>
  )
}

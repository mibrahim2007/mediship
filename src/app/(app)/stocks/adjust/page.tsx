import { requireTenantSession } from "@/lib/auth/session"
import { getProducts } from "@/lib/db/inventory"
import { StockAdjustForm } from "@/components/app/stock-adjust-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StockAdjustPage({ searchParams }: { searchParams: { product?: string } }) {
  const session = await requireTenantSession()
  const products = await getProducts(session.companyId!)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stocks" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Adjustment</h1>
          <p className="text-slate-500 text-sm mt-0.5">Add or remove inventory manually</p>
        </div>
      </div>
      <StockAdjustForm
        products={products as any}
        defaultProductId={searchParams.product}
      />
    </div>
  )
}

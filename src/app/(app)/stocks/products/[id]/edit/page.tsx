import { requireTenantSession } from "@/lib/auth/session"
import { getProductById } from "@/lib/db/inventory"
import { ProductForm } from "@/components/app/product-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireTenantSession()
  const product = await getProductById(params.id, session.companyId!)
  if (!product) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={"/stocks/products/" + params.id} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-500 text-sm mt-0.5">{product.name}</p>
        </div>
      </div>

      <ProductForm
        editId={params.id}
        defaultValues={{
          name:          product.name,
          internal_ref:  product.internal_ref ?? undefined,
          category:      product.category ?? undefined,
          uom:           product.uom,
          cost_price:    Number(product.cost_price ?? 0),
          sales_price:   Number(product.sales_price ?? 0),
          tax_rate:      Number(product.tax_rate ?? 0),
          reorder_point: Number(product.reorder_point ?? 0),
          reorder_qty:   Number(product.reorder_qty ?? 0),
        }}
      />
    </div>
  )
}

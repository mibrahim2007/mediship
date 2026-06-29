"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { WifiOff } from "lucide-react"
import { offlineDb, type CachedOrder } from "@/lib/offline/db"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ServerOrder {
  id: string
  order_no: string
  order_date: string
  status: string
  total: number
  contacts?: { name?: string } | null
}

interface Props {
  initialOrders: ServerOrder[]
}

const STATUS_STYLE: Record<string, string> = {
  quotation:   "bg-slate-100 text-slate-600",
  sales_order: "bg-teal-100 text-teal-700",
  to_invoice:  "bg-amber-100 text-amber-700",
  invoiced:    "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-600",
}

const STATUS_LABEL: Record<string, string> = {
  quotation:   "Quotation",
  sales_order: "Sales Order",
  to_invoice:  "To Invoice",
  invoiced:    "Invoiced",
  cancelled:   "Cancelled",
}

export default function SalesOrdersList({ initialOrders }: Props) {
  const [isOnline, setIsOnline] = useState(true)
  const [orders, setOrders] = useState<CachedOrder[]>([])
  const [cachedAt, setCachedAt] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online",  onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online",  onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  // When online with server data: write cache
  useEffect(() => {
    if (!mounted || initialOrders.length === 0) return
    const now = new Date().toISOString()
    const rows: CachedOrder[] = initialOrders.map(o => ({
      id:           o.id,
      order_no:     o.order_no,
      order_date:   o.order_date,
      status:       o.status,
      total:        o.total ?? 0,
      contact_name: o.contacts?.name,
      cachedAt:     now,
    }))
    offlineDb.cachedOrders.bulkPut(rows).catch(() => {})
    setOrders(rows)
    setCachedAt(now)
  }, [mounted, initialOrders])

  // When offline: read from cache
  useEffect(() => {
    if (!mounted || isOnline) return
    offlineDb.cachedOrders.toArray().then(rows => {
      if (rows.length > 0) {
        setOrders(rows)
        setCachedAt(rows[0].cachedAt)
      }
    }).catch(() => {})
  }, [mounted, isOnline])

  const displayOrders = isOnline ? orders : orders

  return (
    <>
      {mounted && !isOnline && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>
            You are offline — showing cached orders
            {cachedAt && (
              <span className="text-amber-500 ml-1">
                (as of {new Date(cachedAt).toLocaleString()})
              </span>
            )}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Order #</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Customer</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map(o => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/sales/${o.id}`} className="font-mono text-xs text-teal-700 hover:underline font-medium">
                    {o.order_no}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-700">{o.contact_name ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(o.order_date)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium text-slate-900">{formatCurrency(o.total ?? 0)}</td>
              </tr>
            ))}
            {displayOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                  <p className="text-base mb-1">{isOnline ? "No sales orders yet" : "No cached orders available"}</p>
                  <p className="text-xs">{isOnline ? "Create your first order to get started" : "Visit this page online first to cache your orders"}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, DollarSign, ShoppingCart, Package,
  Warehouse, Settings, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard",   label: "Dashboard",  icon: LayoutDashboard },
  { href: "/sales",       label: "Sales",       icon: ShoppingCart },
  { href: "/purchase",    label: "Purchase",    icon: Package },
  { href: "/stocks",      label: "Inventory",   icon: Warehouse },
  { href: "/finance",     label: "Finance",     icon: DollarSign },
  { href: "/crm",         label: "CRM",         icon: Activity },
  { href: "/settings",    label: "Settings",    icon: Settings },
]

export default function AppSidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">M</div>
        <div>
          <p className="text-sm font-semibold text-slate-800">MediShip</p>
          <p className="text-xs text-slate-400">ERP Platform</p>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              path.startsWith(href)
                ? "bg-teal-50 text-teal-700 border border-teal-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

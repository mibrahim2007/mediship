"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  LayoutDashboard, DollarSign, ShoppingCart, Package,
  Warehouse, Settings, Activity, Users, BarChart2, ChevronRight, MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_KEYS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/sales",     key: "sales",     icon: ShoppingCart },
  { href: "/purchase",  key: "purchase",  icon: Package },
  { href: "/stocks",    key: "inventory", icon: Warehouse },
  { href: "/finance",   key: "finance",   icon: DollarSign },
  { href: "/crm",       key: "crm",       icon: Activity },
  { href: "/settings",  key: "settings",  icon: Settings },
] as const

export default function AppSidebar() {
  const path = usePathname()
  const t = useTranslations("nav")
  const b = useTranslations("brand")

  const salesActive  = path.startsWith("/sales")
  const teamsActive  = path.startsWith("/sales/teams")
  const areasActive  = path.startsWith("/sales/areas")

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">M</div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{b("name")}</p>
          <p className="text-xs text-slate-400">{b("tagline")}</p>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_KEYS.map(({ href, key, icon: Icon }) => (
          <div key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                path === href || (path.startsWith(href) && href !== "/sales")
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                  : href === "/sales" && salesActive && !teamsActive
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                  : href === "/sales" && salesActive
                  ? "text-teal-700 hover:bg-teal-50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {t(key)}
              {href === "/sales" && salesActive && (
                <ChevronRight className="h-3 w-3 ml-auto text-slate-400" />
              )}
            </Link>

            {/* Sales sub-navigation */}
            {href === "/sales" && salesActive && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-teal-100 pl-3">
                <Link
                  href="/sales"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    path === "/sales" || (path.startsWith("/sales/") && !path.startsWith("/sales/teams"))
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Orders
                </Link>
                <Link
                  href="/sales/teams"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    teamsActive
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Users className="h-3.5 w-3.5" /> Distribution Teams
                </Link>
                <Link
                  href="/sales/areas"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    areasActive
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" /> Areas
                </Link>
                <Link
                  href="/sales/teams/comparison"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    path === "/sales/teams/comparison"
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <BarChart2 className="h-3.5 w-3.5" /> Comparison
                </Link>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

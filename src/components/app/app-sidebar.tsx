"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import {
  LayoutDashboard, DollarSign, ShoppingCart, Package,
  Warehouse, Settings, Activity, Users, BarChart2, MapPin,
  SlidersHorizontal, Layers, CreditCard, BookOpen, Contact2,
  TrendingUp, ChevronDown, PanelLeftClose, PanelLeftOpen,
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

type SectionKey = "sales" | "purchase" | "stocks" | "finance" | "crm"

const SECTION_MAP: Partial<Record<string, SectionKey>> = {
  "/sales":    "sales",
  "/purchase": "purchase",
  "/stocks":   "stocks",
  "/finance":  "finance",
  "/crm":      "crm",
}

export default function AppSidebar() {
  const path = usePathname()
  const t = useTranslations("nav")
  const b = useTranslations("brand")

  const [open, setOpen] = useState(true)
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    sales: true, purchase: true, stocks: true, finance: true, crm: true,
  })

  const toggle = (key: SectionKey) =>
    setSections(prev => ({ ...prev, [key]: !prev[key] }))

  const salesActive    = path.startsWith("/sales")
  const teamsActive    = path.startsWith("/sales/teams")
  const areasActive    = path.startsWith("/sales/areas")
  const purchaseActive = path.startsWith("/purchase")
  const stocksActive   = path.startsWith("/stocks")
  const financeActive  = path.startsWith("/finance")
  const crmActive      = path.startsWith("/crm")

  function isActive(href: string) {
    if (href === "/dashboard" || href === "/settings") return path === href
    if (href === "/sales")    return salesActive
    if (href === "/purchase") return purchaseActive
    if (href === "/stocks")   return stocksActive
    if (href === "/finance")  return financeActive
    if (href === "/crm")      return crmActive
    return false
  }

  const SUB_LINKS: Partial<Record<string, { href: string; label: string; icon: React.ElementType; active: boolean }[]>> = {
    "/sales": [
      { href: "/sales",                   label: "Orders",             icon: ShoppingCart, active: path === "/sales" || (path.startsWith("/sales/") && !teamsActive && !areasActive && path !== "/sales/teams/comparison" && path !== "/sales/new") },
      { href: "/sales/new",               label: "New Order",          icon: ShoppingCart, active: path === "/sales/new" },
      { href: "/sales/teams",             label: "Distribution Teams", icon: Users,        active: teamsActive },
      { href: "/sales/areas",             label: "Areas",              icon: MapPin,       active: areasActive },
      { href: "/sales/teams/comparison",  label: "Comparison",         icon: BarChart2,    active: path === "/sales/teams/comparison" },
    ],
    "/purchase": [
      { href: "/purchase",     label: "Orders",    icon: Package, active: path === "/purchase" || (purchaseActive && path !== "/purchase/new") },
      { href: "/purchase/new", label: "New Order", icon: Package, active: path === "/purchase/new" },
    ],
    "/stocks": [
      { href: "/stocks",        label: "Products",     icon: Layers,            active: path === "/stocks" || (stocksActive && path !== "/stocks/adjust" && !path.startsWith("/stocks/products/new")) },
      { href: "/stocks/adjust", label: "Adjust Stock", icon: SlidersHorizontal, active: path === "/stocks/adjust" },
    ],
    "/finance": [
      { href: "/finance/accounts",    label: "Accounts",     icon: CreditCard, active: path.startsWith("/finance/accounts") },
      { href: "/finance/journal/new", label: "Journal Entry", icon: BookOpen,   active: path.startsWith("/finance/journal") },
    ],
    "/crm": [
      { href: "/crm/contacts",     label: "Contacts",    icon: Contact2,  active: path === "/crm/contacts" || (path.startsWith("/crm/contacts") && path !== "/crm/contacts/new") },
      { href: "/crm/contacts/new", label: "New Contact", icon: Contact2,  active: path === "/crm/contacts/new" },
      { href: "/crm/leads/new",    label: "Leads",       icon: TrendingUp, active: path.startsWith("/crm/leads") },
    ],
  }

  return (
    <aside className={cn(
      "flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden",
      open ? "w-56" : "w-14"
    )}>
      {/* Brand header */}
      <div className="flex items-center gap-2 px-3 py-3.5 border-b border-slate-100 min-h-[57px]">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          M
        </div>
        {open && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{b("name")}</p>
            <p className="text-xs text-slate-400 truncate">{b("tagline")}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_KEYS.map(({ href, key, icon: Icon }) => {
          const subLinks = SUB_LINKS[href]
          const sectionKey = SECTION_MAP[href]
          const parentActive = isActive(href)
          const expanded = sectionKey ? sections[sectionKey] : false

          return (
            <div key={href}>
              {/* Parent row */}
              <div className="flex items-center gap-1">
                <Link
                  href={href}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-0",
                    parentActive
                      ? "bg-teal-50 text-teal-700 border border-teal-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {open && <span className="truncate">{t(key)}</span>}
                </Link>

                {/* Expand/collapse chevron — only when sidebar is open and section has sub-links */}
                {open && subLinks && sectionKey && (
                  <button
                    onClick={() => toggle(sectionKey)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      expanded ? "rotate-0" : "-rotate-90"
                    )} />
                  </button>
                )}
              </div>

              {/* Sub-links — visible when sidebar open and section expanded */}
              {open && subLinks && expanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
                  {subLinks.map(({ href: subHref, label, icon: SubIcon, active: subActive }) => (
                    <Link
                      key={subHref}
                      href={subHref}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        subActive
                          ? "text-teal-700 bg-teal-50"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar collapse toggle */}
      <div className="p-2 border-t border-slate-100">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {open
            ? <><PanelLeftClose className="h-4 w-4 flex-shrink-0" /><span className="text-xs">Collapse</span></>
            : <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
          }
        </button>
      </div>
    </aside>
  )
}

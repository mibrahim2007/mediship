"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { LayoutDashboard, Building2, CreditCard, ListOrdered, Users, Settings, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_KEYS = [
  { href: "/admin/dashboard",     key: "dashboard",     icon: LayoutDashboard },
  { href: "/admin/companies",     key: "companies",     icon: Building2 },
  { href: "/admin/plans",         key: "plans",         icon: CreditCard },
  { href: "/admin/subscriptions", key: "subscriptions", icon: ListOrdered },
  { href: "/admin/users",         key: "adminUsers",    icon: Users },
  { href: "/admin/settings",      key: "settings",      icon: Settings },
] as const

export default function AdminSidebar() {
  const path = usePathname()
  const t = useTranslations("nav")
  const b = useTranslations("brand")

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="flex items-center gap-2 p-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{b("name")}</p>
          <p className="text-xs text-slate-400">{b("adminPanel")}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_KEYS.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              path.startsWith(href)
                ? "bg-teal-600/20 text-teal-400 border border-teal-600/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {t(key)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

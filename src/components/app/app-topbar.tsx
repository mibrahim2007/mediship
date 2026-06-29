"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { LogOut, User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import type { JwtPayload } from "@/types/auth"
import OfflineSyncWidget from "@/components/app/offline-sync-widget"
import { storeOfflineSession, clearOfflineSession } from "@/lib/offline/session"

interface Props {
  user: JwtPayload
  locale: string
}

export default function AppTopbar({ user, locale }: Props) {
  const router = useRouter()
  const t = useTranslations("auth")

  // Refresh offline session on every authenticated page load so mobile users
  // who are already logged in (didn't go through the login form) still get it
  useEffect(() => {
    storeOfflineSession({ name: user.fullName ?? user.email ?? "", role: user.role ?? "" })
  }, [user.fullName, user.email, user.role])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    clearOfflineSession()
    toast.success(t("signedOut"))
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <OfflineSyncWidget />
      <div className="flex items-center gap-2">
        <LanguageSwitcher current={locale} variant="light" />
        <Button variant="ghost" size="sm" className="text-slate-500">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-slate-600 px-2">
          <User className="h-4 w-4" />
          <span>{user.fullName ?? user.email}</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
            {user.role?.replace("_", " ")}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-slate-900">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

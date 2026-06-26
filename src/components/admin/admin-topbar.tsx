"use client"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import type { JwtPayload } from "@/types/auth"

interface Props {
  user: JwtPayload
  locale: string
}

export default function AdminTopbar({ user, locale }: Props) {
  const router = useRouter()
  const t = useTranslations("auth")

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success(t("signedOut"))
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} variant="dark" />
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="h-4 w-4" />
          <span>{user.fullName ?? user.email}</span>
          <span className="text-xs px-1.5 py-0.5 bg-teal-600/20 text-teal-400 rounded border border-teal-600/30">
            {user.platformRole?.replace("platform_", "").replace("_", " ")}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

"use client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut, User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JwtPayload } from "@/types/auth"

export default function AppTopbar({ user }: { user: JwtPayload }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-2">
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

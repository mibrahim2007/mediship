import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getLocale } from "next-intl/server"
import AppSidebar from "@/components/app/app-sidebar"
import AppTopbar from "@/components/app/app-topbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([getSession(), getLocale()])
  if (!session?.companyId) redirect("/login")

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppTopbar user={session} locale={locale} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

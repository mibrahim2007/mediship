import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminTopbar from "@/components/admin/admin-topbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.platformRole) redirect("/admin/login")

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar user={session} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  )
}

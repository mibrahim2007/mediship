import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { UserCheck, UserX } from "lucide-react"

export const dynamic = "force-dynamic"

async function getAdminUsers() {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, username, email, full_name, platform_role, is_active, last_login_at, created_at")
    .not("platform_role", "is", null)
    .order("created_at", { ascending: false })
  return data ?? []
}

const roleColor: Record<string, string> = {
  super_admin: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  support:     "bg-blue-500/20 text-blue-400 border-blue-500/30",
  billing:     "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

export default async function AdminUsersPage() {
  const admins = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Users</h1>
        <p className="text-slate-400 text-sm mt-1">{admins.length} platform staff members</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-slate-400 font-medium">User</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Role</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Last Login</th>
                <th className="text-left px-5 py-3 text-slate-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{u.full_name ?? u.username}</p>
                    <p className="text-slate-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${roleColor[u.platform_role] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                      {u.platform_role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.is_active
                      ? <span className="flex items-center gap-1 text-green-400 text-xs"><UserCheck className="h-3.5 w-3.5" /> Active</span>
                      : <span className="flex items-center gap-1 text-red-400 text-xs"><UserX className="h-3.5 w-3.5" /> Inactive</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{u.last_login_at ? formatDate(u.last_login_at) : "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(u.created_at)}</td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No admin users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

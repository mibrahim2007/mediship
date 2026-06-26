import { requireTenantSession } from "@/lib/auth/session"
import { getCompanyById } from "@/lib/db/companies"
import { getSubscriptionByCompany } from "@/lib/db/subscriptions"
import { getUsersByCompany } from "@/lib/db/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await requireTenantSession()
  const cid = session.companyId!

  const [company, sub, users] = await Promise.all([
    getCompanyById(cid),
    getSubscriptionByCompany(cid),
    getUsersByCompany(cid),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Company and subscription details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Name" value={company?.name} />
            <Row label="Email" value={company?.email} />
            <Row label="Phone" value={company?.phone} />
            <Row label="Address" value={company?.address} />
            <Row label="Tax Reg." value={company?.tax_reg_no} />
            <Row label="Currency" value={company?.currency} />
            <Row label="Status" value={company?.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Plan" value={(sub?.plans as any)?.display_name} />
            <Row label="Status" value={sub?.status} />
            <Row label="Billing Cycle" value={sub?.billing_cycle} />
            <Row label="Trial Ends" value={sub?.trial_ends_at ? formatDate(sub.trial_ends_at) : undefined} />
            <Row label="Renews" value={sub?.current_period_end ? formatDate(sub.current_period_end) : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-800 font-medium">{u.full_name ?? u.username}</p>
                    <p className="text-slate-400 text-xs">{u.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 rounded capitalize">{u.role?.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value ?? "—"}</span>
    </div>
  )
}

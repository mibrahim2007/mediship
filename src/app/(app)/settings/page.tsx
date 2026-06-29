import { requireTenantSession } from "@/lib/auth/session"
import { getCompanyById } from "@/lib/db/companies"
import { getSubscriptionByCompany } from "@/lib/db/subscriptions"
import { getUsersByCompany } from "@/lib/db/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Smartphone, ExternalLink } from "lucide-react"
import QRCode from "qrcode"

export const dynamic = "force-dynamic"

const PWA_URL = "https://mediship-pwa.vercel.app"

export default async function SettingsPage() {
  const session = await requireTenantSession()
  const cid = session.companyId!

  const [company, sub, users, qrDataUrl] = await Promise.all([
    getCompanyById(cid),
    getSubscriptionByCompany(cid),
    getUsersByCompany(cid),
    QRCode.toDataURL(PWA_URL, { width: 200, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } }),
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

        {/* Mobile App card — spans full width */}
        <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-teal-600" />
              MediShip Mobile App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-600">
                  Access MediShip from your Android phone — book orders, manage leads, check stock, and create purchase orders on the go.
                </p>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-teal-700">
                  {PWA_URL}
                  <a href={PWA_URL} target="_blank" rel="noopener noreferrer" className="ml-auto text-slate-400 hover:text-teal-600">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <p className="font-medium text-slate-600">Option A — Install as PWA (no download):</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the URL above in <strong>Chrome</strong> on your Android phone</li>
                    <li>Tap the <strong>⋮ menu → "Add to Home Screen"</strong></li>
                    <li>Tap <strong>Add</strong> — MediShip icon appears on your home screen</li>
                  </ol>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <p className="font-medium text-slate-600">Option B — Install as native APK:</p>
                  <a
                    href="https://github.com/mibrahim2007/mediship-pwa/releases/latest/download/app-release-signed.apk"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors"
                  >
                    Download APK
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-slate-400">Enable "Install from unknown sources" in Android settings first.</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <a href={PWA_URL} target="_blank" rel="noopener noreferrer">
                  <img
                    src={qrDataUrl}
                    alt="Scan to open MediShip mobile app"
                    width={120}
                    height={120}
                    className="rounded-2xl border-2 border-teal-100 shadow-sm"
                  />
                </a>
                <p className="text-[10px] text-slate-400 text-center">Scan with phone camera<br />to open the app</p>
              </div>
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

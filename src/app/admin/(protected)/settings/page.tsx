import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Globe, Mail, Key } from "lucide-react"

export const dynamic = "force-dynamic"

const SETTINGS = [
  {
    icon: Globe,
    title: "Platform",
    items: [
      { label: "Platform Name", value: "MediShip" },
      { label: "Default Currency", value: "PKR" },
      { label: "Default Language", value: "English" },
      { label: "Timezone", value: "Asia/Karachi" },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    items: [
      { label: "JWT Access Token TTL", value: "1 hour" },
      { label: "JWT Refresh Token TTL", value: "7 days" },
      { label: "Password Min Length", value: "8 characters" },
      { label: "Session Strategy", value: "Cookie-based (HttpOnly)" },
    ],
  },
  {
    icon: Mail,
    title: "Email",
    items: [
      { label: "Transactional Email", value: "Not configured" },
      { label: "From Address", value: "noreply@mediship.com" },
      { label: "Welcome Email", value: "Disabled" },
      { label: "Invoice Email", value: "Disabled" },
    ],
  },
  {
    icon: Key,
    title: "Integrations",
    items: [
      { label: "Supabase", value: "Connected" },
      { label: "Payment Gateway", value: "Not configured" },
      { label: "SMS Provider", value: "Not configured" },
      { label: "Analytics", value: "Not configured" },
    ],
  },
]

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configuration and integration settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SETTINGS.map(({ icon: Icon, title, items }) => (
          <Card key={title} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal-400" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm text-slate-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-1">Environment</p>
        <p>Settings that require code changes are managed via environment variables in <code className="text-teal-400">.env.local</code>. Future releases will expose an editable UI for runtime configuration.</p>
      </div>
    </div>
  )
}

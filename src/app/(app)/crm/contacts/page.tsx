import { requireTenantSession } from "@/lib/auth/session"
import { getContacts } from "@/lib/db/crm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const TYPE_STYLE: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  vendor:   "bg-amber-100 text-amber-700",
  both:     "bg-purple-100 text-purple-700",
}

export default async function ContactsPage() {
  const session = await requireTenantSession()
  const contacts = await getContacts(session.companyId!)

  const customers = contacts.filter((c: any) => c.type === "customer" || c.type === "both").length
  const vendors   = contacts.filter((c: any) => c.type === "vendor"   || c.type === "both").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/crm" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
            <p className="text-slate-500 text-sm mt-1">{contacts.length} contacts · {customers} customers · {vendors} vendors</p>
          </div>
        </div>
        <Link href="/crm/contacts/new">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Type</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Company</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Phone</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">City</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/crm/contacts/${c.id}`} className="font-medium text-slate-900 hover:text-teal-700">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${TYPE_STYLE[c.type] ?? "bg-slate-100 text-slate-600"}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.company_name ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{c.city ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {!contacts.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No contacts yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

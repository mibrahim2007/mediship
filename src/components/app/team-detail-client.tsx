"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserPlus, Trash2, Package, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  addTeamMemberAction, removeTeamMemberAction,
  addTeamProductAction, removeTeamProductAction,
} from "@/lib/actions/teams"

const sel = cn(
  "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm",
  "outline-none transition-colors focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500",
  "[&>option]:bg-white"
)

interface Member { id: string; user_id: string; users: { id: string; full_name?: string; role?: string; email?: string } }
interface Product { id: string; product_id: string; target_qty: number; products: { id: string; name: string; uom: string; internal_ref?: string; category?: string } }
interface User { id: string; full_name?: string; role?: string }
interface Prod { id: string; name: string; uom: string; internal_ref?: string }

interface Props {
  teamId: string
  members: Member[]
  products: Product[]
  allReps: User[]
  allProducts: Prod[]
}

export function TeamDetailClient({ teamId, members, products, allReps, allProducts }: Props) {
  const [, startTransition] = useTransition()
  const [addingMember, setAddingMember] = useState(false)
  const [addingProduct, setAddingProduct] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [targetQty, setTargetQty] = useState("0")

  const existingUserIds = new Set(members.map((m) => m.user_id))
  const existingProductIds = new Set(products.map((p) => p.product_id))
  const availableReps = allReps.filter((u) => !existingUserIds.has(u.id))
  const availableProducts = allProducts.filter((p) => !existingProductIds.has(p.id))

  function handleAddMember() {
    if (!selectedUser) return toast.error("Please select a team member")
    startTransition(async () => {
      try {
        await addTeamMemberAction(teamId, { user_id: selectedUser })
        toast.success("Member added")
        setAddingMember(false)
        setSelectedUser("")
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to add member")
      }
    })
  }

  function handleRemoveMember(userId: string, name: string) {
    if (!confirm(`Remove ${name} from the team?`)) return
    startTransition(async () => {
      try {
        await removeTeamMemberAction(teamId, userId)
        toast.success("Member removed")
      } catch {
        toast.error("Failed to remove member")
      }
    })
  }

  function handleAddProduct() {
    if (!selectedProduct) return toast.error("Please select a medicine")
    startTransition(async () => {
      try {
        await addTeamProductAction(teamId, { product_id: selectedProduct, target_qty: Number(targetQty) })
        toast.success("Medicine assigned")
        setAddingProduct(false)
        setSelectedProduct("")
        setTargetQty("0")
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to assign medicine")
      }
    })
  }

  function handleRemoveProduct(productId: string, name: string) {
    if (!confirm(`Remove ${name} from team assignments?`)) return
    startTransition(async () => {
      try {
        await removeTeamProductAction(teamId, productId)
        toast.success("Medicine removed")
      } catch {
        toast.error("Failed to remove medicine")
      }
    })
  }

  const ROLE_LABEL: Record<string, string> = {
    sales_manager: "Sales Manager",
    sales_rep: "Sales Rep",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Members */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">{members.length}/4 members</p>
          </div>
          {members.length < 4 && !addingMember && (
            <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" onClick={() => setAddingMember(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" /> Add Member
            </Button>
          )}
        </div>

        {addingMember && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <Label className="text-xs text-slate-600">Select Sales Rep</Label>
            <select className={sel} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">— Choose a rep —</option>
              {availableReps.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name ?? u.id} ({ROLE_LABEL[u.role ?? ""] ?? u.role})</option>
              ))}
            </select>
            {availableReps.length === 0 && <p className="text-xs text-slate-400">No available sales reps</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMember} disabled={!selectedUser} className="bg-teal-600 hover:bg-teal-700">
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingMember(false); setSelectedUser("") }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {members.length === 0 && !addingMember && (
            <p className="text-sm text-slate-400 text-center py-6">No members yet. Add up to 4 sales reps.</p>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
                  {(m.users?.full_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.users?.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-slate-400">{ROLE_LABEL[m.users?.role ?? ""] ?? m.users?.role}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveMember(m.user_id, m.users?.full_name ?? "member")}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {members.length >= 4 && (
          <p className="text-xs text-amber-600 mt-3 text-center">Maximum 4 members per team reached</p>
        )}
      </div>

      {/* Assigned Medicines */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Assigned Medicines</h2>
            <p className="text-xs text-slate-400 mt-0.5">{products.length} products assigned</p>
          </div>
          {!addingProduct && (
            <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" onClick={() => setAddingProduct(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Assign Medicine
            </Button>
          )}
        </div>

        {addingProduct && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div>
              <Label className="text-xs text-slate-600">Select Medicine / Product</Label>
              <select className={cn(sel, "mt-1")} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">— Choose a product —</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.internal_ref ? ` [${p.internal_ref}]` : ""} — {p.uom}
                  </option>
                ))}
              </select>
              {availableProducts.length === 0 && <p className="text-xs text-slate-400 mt-1">All products already assigned</p>}
            </div>
            <div>
              <Label className="text-xs text-slate-600">Monthly Target Qty</Label>
              <Input
                type="number" min="0" step="1"
                className="border-slate-200 mt-1"
                value={targetQty}
                onChange={(e) => setTargetQty(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddProduct} disabled={!selectedProduct} className="bg-teal-600 hover:bg-teal-700">
                Assign
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingProduct(false); setSelectedProduct(""); setTargetQty("0") }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {products.length === 0 && !addingProduct && (
            <p className="text-sm text-slate-400 text-center py-6">No medicines assigned yet.</p>
          )}
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.products?.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.products?.uom}{p.products?.category ? ` · ${p.products.category}` : ""}
                    {p.target_qty > 0 ? ` · Target: ${p.target_qty}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveProduct(p.product_id, p.products?.name ?? "product")}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"
import { offlineDb } from "./db"
import { createSalesOrderAction } from "@/lib/actions/sales"

export async function syncPendingOrders(): Promise<{ synced: number; failed: number }> {
  const pending = await offlineDb.pendingOrders
    .where("status").anyOf(["pending", "error"])
    .toArray()

  let synced = 0
  let failed = 0

  for (const order of pending) {
    try {
      await offlineDb.pendingOrders.update(order.id!, { status: "syncing" })
      await createSalesOrderAction(order.data as any)
      await offlineDb.pendingOrders.delete(order.id!)
      synced++
    } catch (err: any) {
      await offlineDb.pendingOrders.update(order.id!, {
        status: "error",
        errorMsg: err?.message ?? "Unknown error",
      })
      failed++
    }
  }

  return { synced, failed }
}

export async function getPendingCount(): Promise<number> {
  return offlineDb.pendingOrders.where("status").anyOf(["pending", "error"]).count()
}

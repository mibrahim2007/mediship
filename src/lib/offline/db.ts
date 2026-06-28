import Dexie, { type Table } from "dexie"

export interface PendingOrder {
  id?: number
  tempId: string
  data: Record<string, unknown>
  createdAt: string
  status: "pending" | "syncing" | "error"
  errorMsg?: string
}

export interface CachedContact {
  id: string
  name: string
  payment_terms?: string
}

export interface CachedProduct {
  id: string
  name: string
  uom: string
  sales_price: number
  tax_rate: number
  internal_ref?: string
}

export interface CachedWarehouse {
  id: string
  name: string
  code: string
}

class MediShipOfflineDB extends Dexie {
  pendingOrders!: Table<PendingOrder>
  cachedContacts!: Table<CachedContact>
  cachedProducts!: Table<CachedProduct>
  cachedWarehouses!: Table<CachedWarehouse>

  constructor() {
    super("mediship-offline-v1")
    this.version(1).stores({
      pendingOrders:   "++id, tempId, status",
      cachedContacts:  "id",
      cachedProducts:  "id",
      cachedWarehouses:"id",
    })
  }
}

export const offlineDb = new MediShipOfflineDB()

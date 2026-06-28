"use client"
import { useEffect, useState, useCallback } from "react"
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getPendingCount, syncPendingOrders } from "@/lib/offline/sync"
import { cn } from "@/lib/utils"

export default function OfflineSyncWidget() {
  const [isOnline, setIsOnline]       = useState(true)
  const [pending,  setPending]        = useState(0)
  const [syncing,  setSyncing]        = useState(false)
  const [mounted,  setMounted]        = useState(false)

  const refreshCount = useCallback(async () => {
    try { setPending(await getPendingCount()) } catch {}
  }, [])

  const runSync = useCallback(async () => {
    if (syncing || !isOnline) return
    setSyncing(true)
    try {
      const { synced, failed } = await syncPendingOrders()
      await refreshCount()
      if (synced > 0) toast.success(`${synced} order${synced > 1 ? "s" : ""} synced to server`)
      if (failed > 0)  toast.error(`${failed} order${failed > 1 ? "s" : ""} failed — will retry`)
    } catch (err: any) {
      toast.error(err?.message ?? "Sync failed")
    } finally {
      setSyncing(false)
    }
  }, [syncing, isOnline, refreshCount])

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)
    refreshCount()

    const onOnline  = () => { setIsOnline(true);  refreshCount() }
    const onOffline = () => setIsOnline(false)

    window.addEventListener("online",  onOnline)
    window.addEventListener("offline", onOffline)

    // Poll pending count every 10 s
    const timer = setInterval(refreshCount, 10_000)

    return () => {
      window.removeEventListener("online",  onOnline)
      window.removeEventListener("offline", onOffline)
      clearInterval(timer)
    }
  }, [refreshCount])

  // Auto-sync when connection is restored
  useEffect(() => {
    if (isOnline && pending > 0 && mounted) runSync()
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      {/* Offline / online indicator */}
      {isOnline ? (
        <span className="flex items-center gap-1 text-xs text-teal-600">
          <Wifi className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium">
          <WifiOff className="h-3.5 w-3.5" /> Offline
        </span>
      )}

      {/* Pending orders badge + sync button */}
      {pending > 0 && (
        <button
          onClick={runSync}
          disabled={syncing || !isOnline}
          title={isOnline ? `Sync ${pending} pending order${pending > 1 ? "s" : ""}` : "Will sync when online"}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border font-medium transition-colors",
            isOnline
              ? "text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100"
              : "text-amber-700 bg-amber-50 border-amber-200 cursor-not-allowed opacity-70"
          )}
        >
          {syncing
            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            : isOnline
              ? <RefreshCw className="h-3.5 w-3.5" />
              : <AlertCircle className="h-3.5 w-3.5" />
          }
          {pending} pending
        </button>
      )}

      {/* Synced confirmation (no pending) */}
      {pending === 0 && isOnline && mounted && (
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, WifiOff, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { storeOfflineSession, getOfflineSession } from "@/lib/offline/session"

const PAGES_TO_CACHE = ["/sales", "/sales/new", "/crm/leads/new"]

async function warmOfflineCache() {
  if (!("caches" in window)) return
  try {
    // Find the active SW cache (handles version bumps without hardcoding)
    const keys = await caches.keys()
    const cacheName = keys.find((k) => k.startsWith("mediship-shell-")) ?? "mediship-shell-v3"
    const cache = await caches.open(cacheName)
    await Promise.allSettled(
      PAGES_TO_CACHE.map(async (url) => {
        const res = await fetch(url, { credentials: "include" })
        if (res.ok) await cache.put(url, res)
      })
    )
  } catch {}
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [offlineSession, setOfflineSession] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    setOfflineSession(getOfflineSession())
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online",  onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online",  onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Login failed")
        return
      }
      storeOfflineSession({ name: json.user.fullName ?? json.user.email, role: json.user.role })
      // Warm cache directly — works regardless of whether SW is the controller yet
      warmOfflineCache()
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-xl mb-4">M</div>
          <h1 className="text-2xl font-bold text-slate-900">MediShip</h1>
          <p className="text-slate-500 text-sm mt-1">Medical Supply & Distribution</p>
        </div>

        {!isOnline && offlineSession && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
              <WifiOff className="h-4 w-4" />
              You are offline
            </div>
            <p className="text-xs text-amber-600">
              Welcome back, <strong>{offlineSession.name}</strong>. You were previously signed in. You can continue working offline.
            </p>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => { window.location.href = "/sales" }}
            >
              Continue to App
            </Button>
          </div>
        )}

        {!isOnline && !offlineSession && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center gap-2 text-sm text-amber-700">
            <WifiOff className="h-4 w-4 shrink-0" />
            You are offline. Please connect to the internet to sign in.
          </div>
        )}

        {/* Mobile app banner */}
        <a
          href="https://mediship-pwa.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-teal-100 bg-teal-50 hover:bg-teal-100 transition-colors group"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-teal-800">Use MediShip on your phone</p>
            <p className="text-xs text-teal-600 truncate">mediship-pwa.vercel.app — install as Android app</p>
          </div>
          <span className="ml-auto text-teal-400 group-hover:text-teal-600 text-lg leading-none">→</span>
        </a>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your email or username to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input id="identifier" {...register("identifier")} placeholder="you@company.com" autoFocus disabled={!isOnline} />
                {errors.identifier && <p className="text-xs text-red-500">{errors.identifier.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" disabled={!isOnline} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading || !isOnline}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

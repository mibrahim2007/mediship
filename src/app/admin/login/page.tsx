"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Login failed")
        return
      }
      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500 text-white mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">MediShip Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Platform administration</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Admin sign in</CardTitle>
            <CardDescription className="text-slate-400">Platform staff access only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-slate-300">Email or Username</Label>
                <Input
                  id="identifier"
                  {...register("identifier")}
                  placeholder="admin@mediship.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  autoFocus
                />
                {errors.identifier && <p className="text-xs text-red-400">{errors.identifier.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in to Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

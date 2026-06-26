"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your email or username to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input id="identifier" {...register("identifier")} placeholder="you@company.com" autoFocus />
                {errors.identifier && <p className="text-xs text-red-500">{errors.identifier.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
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

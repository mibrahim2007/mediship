"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { onboardCompanySchema, type OnboardCompanyInput } from "@/lib/validations/company"
import { onboardCompanyAction } from "@/lib/actions/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Plan {
  id: string
  display_name: string
  price_monthly: number
  price_yearly: number
}

interface Props {
  plans: Plan[]
}

const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "AED", "SAR"]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-400 mt-1">{message}</p>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">
      {children}
    </h3>
  )
}

const selectClass = cn(
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-white",
  "shadow-sm transition-colors outline-none",
  "focus-visible:ring-1 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[&>option]:bg-slate-800 [&>option]:text-white"
)

export function OnboardCompanyForm({ plans }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardCompanyInput>({
    resolver: zodResolver(onboardCompanySchema),
    defaultValues: {
      currency: "PKR",
      billing_cycle: "monthly",
      plan_id: plans[0]?.id ?? "",
    },
  })

  const selectedPlanId = watch("plan_id")
  const billingCycle = watch("billing_cycle")
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const planPrice = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.price_yearly
      : selectedPlan.price_monthly
    : null

  async function onSubmit(data: OnboardCompanyInput) {
    try {
      await onboardCompanyAction(data)
      toast.success("Company onboarded successfully")
      router.push("/admin/companies")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to onboard company")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Company Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeading>Company Information</SectionHeading>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name" className="text-slate-300 mb-1.5 block">
              Company Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Acme Medical Supplies"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-300 mb-1.5 block">
              Company Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="info@company.com"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="phone" className="text-slate-300 mb-1.5 block">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+92 300 0000000"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("phone")}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address" className="text-slate-300 mb-1.5 block">
              Address
            </Label>
            <Input
              id="address"
              placeholder="123 Main St, Karachi"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("address")}
            />
          </div>

          <div>
            <Label htmlFor="tax_reg_no" className="text-slate-300 mb-1.5 block">
              Tax / Reg No
            </Label>
            <Input
              id="tax_reg_no"
              placeholder="NTN-1234567"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("tax_reg_no")}
            />
          </div>

          <div>
            <Label htmlFor="currency" className="text-slate-300 mb-1.5 block">
              Currency
            </Label>
            <select id="currency" className={selectClass} {...register("currency")}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeading>Subscription Plan</SectionHeading>

        {plans.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No plans available. <a href="/admin/plans" className="text-teal-400 hover:underline">Create a plan first.</a>
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan_id" className="text-slate-300 mb-1.5 block">
                Plan <span className="text-red-400">*</span>
              </Label>
              <select id="plan_id" className={selectClass} {...register("plan_id")}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
              <FieldError message={errors.plan_id?.message} />
            </div>

            <div>
              <Label htmlFor="billing_cycle" className="text-slate-300 mb-1.5 block">
                Billing Cycle
              </Label>
              <select id="billing_cycle" className={selectClass} {...register("billing_cycle")}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {planPrice !== null && (
              <div className="col-span-2">
                <p className="text-sm text-slate-400">
                  Price:{" "}
                  <span className="text-teal-400 font-semibold">
                    {planPrice.toLocaleString()} / {billingCycle === "yearly" ? "year" : "month"}
                  </span>
                  {" "}· 14-day trial starts immediately
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin User */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <SectionHeading>Admin User Credentials</SectionHeading>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="admin_full_name" className="text-slate-300 mb-1.5 block">
              Full Name
            </Label>
            <Input
              id="admin_full_name"
              placeholder="John Doe"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("admin_full_name")}
            />
          </div>

          <div>
            <Label htmlFor="admin_username" className="text-slate-300 mb-1.5 block">
              Username <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin_username"
              placeholder="john.doe"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("admin_username")}
            />
            <FieldError message={errors.admin_username?.message} />
          </div>

          <div>
            <Label htmlFor="admin_email" className="text-slate-300 mb-1.5 block">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin_email"
              type="email"
              placeholder="admin@company.com"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("admin_email")}
            />
            <FieldError message={errors.admin_email?.message} />
          </div>

          <div>
            <Label htmlFor="admin_password" className="text-slate-300 mb-1.5 block">
              Password <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin_password"
              type="password"
              placeholder="Min 8 characters"
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              {...register("admin_password")}
            />
            <FieldError message={errors.admin_password?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-slate-400 hover:text-white"
          onClick={() => router.push("/admin/companies")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || plans.length === 0}
          className="bg-teal-600 hover:bg-teal-500 min-w-32"
        >
          {isSubmitting ? "Creating..." : "Onboard Company"}
        </Button>
      </div>
    </form>
  )
}

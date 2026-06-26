"use client"
import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { Globe } from "lucide-react"
import { setLocaleAction } from "@/lib/actions/locale"

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ur", flag: "🇵🇰", label: "اردو" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
] as const

interface Props {
  current: string
  variant?: "light" | "dark"
}

export function LanguageSwitcher({ current, variant = "light" }: Props) {
  const t = useTranslations("language")
  const [isPending, startTransition] = useTransition()

  const isDark = variant === "dark"
  const buttonBase = isDark
    ? "text-slate-400 hover:text-white hover:bg-slate-800"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
  const dropdownBase = isDark
    ? "bg-slate-900 border-slate-700 text-white"
    : "bg-white border-slate-200 text-slate-800"
  const itemBase = isDark
    ? "hover:bg-slate-800"
    : "hover:bg-slate-50"
  const activeBase = isDark
    ? "bg-teal-600/20 text-teal-400"
    : "bg-teal-50 text-teal-700"

  function handleChange(code: string) {
    startTransition(() => {
      setLocaleAction(code)
    })
  }

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${buttonBase} ${isPending ? "opacity-50 cursor-wait" : ""}`}
        title={t("label")}
        disabled={isPending}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{LOCALES.find(l => l.code === current)?.flag ?? "🌐"}</span>
        <span className="hidden sm:inline">{LOCALES.find(l => l.code === current)?.label ?? current.toUpperCase()}</span>
      </button>

      <div className={`absolute end-0 top-full mt-1 w-36 rounded-lg border shadow-lg z-50 overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity ${dropdownBase}`}>
        {LOCALES.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${current === code ? activeBase : itemBase}`}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

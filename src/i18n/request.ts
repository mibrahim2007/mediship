import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import en from "../../messages/en.json"
import ur from "../../messages/ur.json"
import ar from "../../messages/ar.json"

export const locales = ["en", "ur", "ar"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"
export const rtlLocales: Locale[] = ["ur", "ar"]

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale)
}

const messages: Record<Locale, typeof en> = { en, ur, ar }

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale
  try {
    const store = await cookies()
    const raw = store.get("locale")?.value ?? defaultLocale
    locale = (locales as readonly string[]).includes(raw) ? (raw as Locale) : defaultLocale
  } catch {
    locale = defaultLocale
  }

  return {
    locale,
    messages: messages[locale],
  }
})

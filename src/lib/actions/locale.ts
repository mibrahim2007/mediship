"use server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { locales, defaultLocale, type Locale } from "@/i18n/request"

export async function setLocaleAction(locale: string) {
  const valid: Locale = (locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale
  const store = await cookies()
  store.set("locale", valid, { maxAge: 60 * 60 * 24 * 365, path: "/" })
  revalidatePath("/", "layout")
}

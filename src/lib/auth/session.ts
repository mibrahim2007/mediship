import { cookies } from "next/headers"
import { verifyJwt } from "./jwt"
import type { JwtPayload } from "@/types/auth"

const ACCESS_COOKIE = "ms_access"
const REFRESH_COOKIE = "ms_refresh"

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
}

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 })
  store.set(REFRESH_COOKIE, refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
}

export async function clearSessionCookies() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

export async function getSession(): Promise<JwtPayload | null> {
  try {
    const store = await cookies()
    const token = store.get(ACCESS_COOKIE)?.value
    if (!token) return null
    return await verifyJwt(token)
  } catch {
    return null
  }
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function requirePlatformSession(): Promise<JwtPayload> {
  const session = await requireSession()
  if (!session.platformRole) throw new Error("Forbidden")
  return session
}

export async function requireTenantSession(): Promise<JwtPayload> {
  const session = await requireSession()
  if (!session.companyId) throw new Error("Forbidden")
  return session
}

export { ACCESS_COOKIE, REFRESH_COOKIE }

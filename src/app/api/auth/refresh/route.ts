import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyRefreshToken, signJwt } from "@/lib/auth/jwt"
import { getUserById } from "@/lib/db/users"
import { setSessionCookies } from "@/lib/auth/session"

export async function POST() {
  try {
    const store = await cookies()
    const refreshToken = store.get("ms_refresh")?.value
    if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 })

    const { userId } = await verifyRefreshToken(refreshToken)
    const user = await getUserById(userId)
    if (!user || !user.is_active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role ?? null,
      companyId: user.company_id ?? null,
      platformRole: user.platform_role ?? null,
    }

    const newAccessToken = await signJwt(payload)
    await setSessionCookies(newAccessToken, refreshToken)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}

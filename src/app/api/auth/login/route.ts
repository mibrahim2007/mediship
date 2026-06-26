import { NextRequest, NextResponse } from "next/server"
import { getUserByIdentifier, updateLastLogin } from "@/lib/db/users"
import { comparePassword } from "@/lib/auth/password"
import { signJwt, signRefreshToken } from "@/lib/auth/jwt"
import { setSessionCookies } from "@/lib/auth/session"
import { loginSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { identifier, password } = parsed.data
    const user = await getUserByIdentifier(identifier)

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Tenant login — must have company_id and role, not platform_role
    if (user.platform_role || !user.company_id) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      companyId: user.company_id,
      platformRole: null,
    }

    const [accessToken, refreshToken] = await Promise.all([
      signJwt(payload),
      signRefreshToken({ userId: user.id }),
    ])

    await Promise.all([
      setSessionCookies(accessToken, refreshToken),
      updateLastLogin(user.id),
    ])

    return NextResponse.json({ ok: true, user: payload })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

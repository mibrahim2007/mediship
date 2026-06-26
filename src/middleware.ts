import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const ACCESS_COOKIE = "ms_access"

async function getPayload(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_COOKIE)?.value
    if (!token) return null
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-in-production")
    const { payload } = await jwtVerify(token, secret)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin routes — require platform_role
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const payload = await getPayload(req)
    if (!payload?.platformRole) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    return NextResponse.next()
  }

  // Tenant app routes — require company_id
  const tenantPaths = ["/dashboard", "/finance", "/sales", "/purchase", "/stocks", "/crm", "/settings"]
  if (tenantPaths.some((p) => pathname.startsWith(p))) {
    const payload = await getPayload(req)
    if (!payload?.companyId) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/finance/:path*",
    "/sales/:path*",
    "/purchase/:path*",
    "/stocks/:path*",
    "/crm/:path*",
    "/settings/:path*",
  ],
}

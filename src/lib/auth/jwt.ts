import { SignJWT, jwtVerify } from "jose"
import type { JwtPayload } from "@/types/auth"

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-in-production")
}

function getRefreshSecret() {
  return new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev-refresh-secret-change-in-production"
  )
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret())
}

export async function signRefreshToken(payload: Pick<JwtPayload, "userId">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret())
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JwtPayload
}

export async function verifyRefreshToken(token: string): Promise<Pick<JwtPayload, "userId">> {
  const { payload } = await jwtVerify(token, getRefreshSecret())
  return payload as unknown as Pick<JwtPayload, "userId">
}

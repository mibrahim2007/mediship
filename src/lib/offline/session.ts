const KEY = "mediship_offline_session"

export interface OfflineSession {
  name: string
  role: string
  at: number
}

export function storeOfflineSession(session: Omit<OfflineSession, "at">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...session, at: Date.now() }))
  } catch {}
}

export function getOfflineSession(): OfflineSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as OfflineSession) : null
  } catch {
    return null
  }
}

export function clearOfflineSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

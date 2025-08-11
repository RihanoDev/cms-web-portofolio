// When VITE_API_BASE is empty, vite dev server proxy will handle "/api" to localhost:8080 as configured in vite.config.
const BASE = (import.meta as any).env?.VITE_API_BASE || ''

export const api = {
  async get(path: string, init?: RequestInit) {
    const res = await fetch(`${BASE}${path}`, { ...init })
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
    return { data: await res.json() }
  },
  async post(path: string, body?: any, init?: RequestInit) {
    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
    return { data: await res.json() }
  }
}

export const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem('cms_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

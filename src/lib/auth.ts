import { useSyncExternalStore } from 'react'

export type Role = 'user' | 'admin'
export interface Session {
  email: string
  role: Role
}

// Mock credentials — prototype only.
const ACCOUNTS: Record<string, { password: string; role: Role }> = {
  'user@sada.app': { password: '123456Sada', role: 'user' },
  'admin@sada.app': { password: '123456Sada', role: 'admin' },
}

const KEY = 'sada.session'
const listeners = new Set<() => void>()

function read(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Session | null
  } catch {
    return null
  }
}

let current = read()

export function login(email: string, password: string): Session | null {
  const account = ACCOUNTS[email.trim().toLowerCase()]
  if (!account || account.password !== password) return null
  current = { email: email.trim().toLowerCase(), role: account.role }
  sessionStorage.setItem(KEY, JSON.stringify(current))
  listeners.forEach((l) => l())
  return current
}

export function logout() {
  current = null
  sessionStorage.clear()
  listeners.forEach((l) => l())
}

export function useSession() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => current,
  )
}

export function homeFor(role: Role) {
  return role === 'admin' ? '/admin' : '/welcome'
}

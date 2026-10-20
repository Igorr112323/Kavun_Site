import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { randomBytes } from 'node:crypto'
import { getDb } from './db'
import { verifyPassword } from './password'
import type { Role, User } from './types'

const COOKIE = 'vs_session'
const TTL_MS = 1000 * 60 * 60 * 24 * 14

export type SessionUser = Pick<User, 'id' | 'email' | 'name' | 'role'>

type SessionRow = { token: string; user_id: number; expires_at: number }

export async function login(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb()
  const normalized = email.trim().toLowerCase()
  const user = db
    .prepare('SELECT id, email, name, role, is_active, password_hash FROM users WHERE lower(email) = ?')
    .get(normalized) as (SessionUser & { is_active: number; password_hash: string }) | undefined

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { ok: false, error: 'Неверная почта или пароль.' }
  }
  if (!user.is_active) {
    return { ok: false, error: 'Доступ для этой учётной записи отключён администратором.' }
  }

  const token = randomBytes(32).toString('hex')
  const expires = Date.now() + TTL_MS
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires)

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expires),
  })
  return { ok: true }
}

export async function logout() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (token) getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
  jar.delete(COOKIE)
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  const db = getDb()
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1`
    )
    .get(token, Date.now()) as SessionUser | undefined
  return row ?? null
})

export function canManageUsers(role: Role | undefined) {
  return role === 'admin'
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}

export async function cleanupSessions() {
  getDb().prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
}

'use server'

import { headers } from 'next/headers'
import { getDb } from '@/lib/db'
import { getSettings } from '@/lib/data'
import { normalizePhone } from '@/lib/utils'

export type LeadState = {
  status: 'idle' | 'ok' | 'error'
  message?: string
  errors?: Record<string, string>
}

const hits = new Map<string, { count: number; reset: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + 10 * 60 * 1000 })
    return false
  }
  entry.count += 1
  return entry.count > 6
}

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const name = String(formData.get('name') ?? '').trim()
  const phoneRaw = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const consent = formData.get('consent')
  const honeypot = String(formData.get('company') ?? '').trim()
  const ts = Number(formData.get('ts') ?? 0)
  const equipmentId = Number(formData.get('equipment_id') ?? 0) || null
  const source = String(formData.get('source_page') ?? '/').slice(0, 200)

  // Боты: скрытое поле или мгновенная отправка. Отвечаем «успехом», но не пишем в базу.
  if (honeypot || (ts && Date.now() - ts < 1500)) {
    return { status: 'ok', message: 'Заявка принята.' }
  }

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Как к вам обращаться? Минимум два символа.'
  if (name.length > 80) errors.name = 'Слишком длинное имя — сократите.'
  const phone = normalizePhone(phoneRaw)
  if (!phone) errors.phone = 'Проверьте номер: нужен российский телефон, 10–11 цифр.'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Почта выглядит неправильно.'
  if (message.length > 2500) errors.message = 'Слишком длинное сообщение — до 2500 символов.'
  if (!consent) errors.consent = 'Без согласия на обработку данных мы не можем принять заявку.'

  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Проверьте поля — пара мелочей и всё уйдёт.', errors }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local'
  const phoneDisplay = getSettings().phone_display || '+7 (988) 000-00-00'
  if (rateLimited(`${ip}:${phone}`)) {
    return {
      status: 'error',
      message: `Похоже, отправляли уже несколько раз. Позвоните нам — так быстрее: ${phoneDisplay}.`,
    }
  }

  try {
    getDb()
      .prepare(
        `INSERT INTO requests (name, phone, email, message, equipment_id, source_page)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(name, phone, email || null, message || null, equipmentId, source)
  } catch {
    return {
      status: 'error',
      message: `Не сохранилось из-за сбоя на сервере. Позвоните: ${phoneDisplay} — примем заявку голосом.`,
    }
  }

  return {
    status: 'ok',
    message: 'Приняли. Ответим в рабочее время, обычно в течение двух часов.',
  }
}

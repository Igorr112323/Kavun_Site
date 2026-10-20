import type { Condition, EquipmentStatus, RequestStatus } from './types'

export const STATUS_LABEL: Record<EquipmentStatus, string> = {
  in_stock: 'В наличии',
  in_transit: 'В пути',
  on_order: 'Под заказ',
  reserved: 'Зарезервировано',
  sold: 'Продано',
}

export const CONDITION_LABEL: Record<Condition, string> = {
  new: 'Новое',
  used: 'Б/У',
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  closed: 'Закрыта',
}

const priceFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return 'по запросу'
  return `${priceFormatter.format(price)} ₽`
}

export function formatNumber(value: number): string {
  return priceFormatter.format(value)
}

export function formatDate(value: string | Date, variant: 'short' | 'long' = 'short'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  if (variant === 'long') {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z')) : value
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function equipmentCountLabel(n: number): string {
  return `${n} ${plural(n, 'единица', 'единицы', 'единиц')}`
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90)
}

export function parseSpecs(raw: string): { label: string; value: string }[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((s) => s && typeof s.label === 'string')
      .map((s) => ({ label: String(s.label), value: String(s.value ?? '') }))
  } catch {
    return []
  }
}

export function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s) => typeof s === 'string' && s.length > 0)
  } catch {
    return []
  }
}

export function safePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`
  if (digits.length === 10) return `+7${digits}`
  return ''
}

export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}

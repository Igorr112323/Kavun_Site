'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { getCurrentUser, login, logout } from '@/lib/auth'
import { PAGE_DEFS } from '@/lib/site-content'
import { slugify } from '@/lib/utils'
import type { Role } from '@/lib/types'

function str(fd: FormData, key: string, fallback = ''): string {
  const value = fd.get(key)
  return typeof value === 'string' ? value.trim() : fallback
}

function num(fd: FormData, key: string): number | null {
  const raw = str(fd, key)
  if (!raw) return null
  const value = Number(raw.replace(/[^\d.-]/g, ''))
  return Number.isFinite(value) ? value : null
}

function bool(fd: FormData, key: string): number {
  return fd.get(key) ? 1 : 0
}

function uniqueSlug(table: 'equipment' | 'posts' | 'categories' | 'manufacturers', desired: string, id?: number): string {
  const db = getDb()
  const base = slugify(desired) || `item-${Date.now()}`
  let candidate = base
  let i = 2
  while (true) {
    const row = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(candidate) as { id: number } | undefined
    if (!row || row.id === id) return candidate
    candidate = `${base}-${i++}`
  }
}

function ok(path: string, message?: string) {
  redirect(message ? `${path}?saved=${encodeURIComponent(message)}` : `${path}?saved=1`)
}

function fail(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = str(formData, 'email')
  const password = str(formData, 'password')
  if (!email || !password) return { error: 'Введите почту и пароль.' }
  const result = await login(email, password)
  if (!result.ok) return { error: result.error }
  redirect('/admin')
}

export async function logoutAction() {
  await logout()
  redirect('/login')
}

/* ---------------- equipment ---------------- */

export async function saveEquipment(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const db = getDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) fail(id ? `/admin/equipment/${id}` : '/admin/equipment/new', 'Название обязательно')

  const labels = fd.getAll('spec_label').map((v) => String(v).trim())
  const values = fd.getAll('spec_value').map((v) => String(v).trim())
  const specs = labels
    .map((label, i) => ({ label, value: values[i] ?? '' }))
    .filter((s) => s.label)

  const images = str(fd, 'images', '[]')
  let imagesValid = '[]'
  try {
    const parsed = JSON.parse(images)
    if (Array.isArray(parsed)) imagesValid = JSON.stringify(parsed.filter((i) => typeof i === 'string'))
  } catch {
    imagesValid = '[]'
  }

  const payload = {
    title,
    slug: uniqueSlug('equipment', str(fd, 'slug') || title, id ?? undefined),
    manufacturer_id: num(fd, 'manufacturer_id'),
    category_id: num(fd, 'category_id'),
    model: str(fd, 'model') || null,
    condition: str(fd, 'condition') === 'used' ? 'used' : 'new',
    year: num(fd, 'year'),
    price: num(fd, 'price'),
    price_on_request: bool(fd, 'price_on_request'),
    status: ['in_stock', 'in_transit', 'on_order', 'reserved', 'sold'].includes(str(fd, 'status'))
      ? str(fd, 'status')
      : 'in_stock',
    specs: JSON.stringify(specs),
    description: str(fd, 'description') || null,
    condition_note: str(fd, 'condition_note') || null,
    checked: bool(fd, 'checked'),
    complete_set: str(fd, 'complete_set') || null,
    power: str(fd, 'power') || null,
    weight: str(fd, 'weight') || null,
    dimensions: str(fd, 'dimensions') || null,
    images: imagesValid,
    passport_url: str(fd, 'passport_url') || null,
    is_published: bool(fd, 'is_published'),
    is_featured: bool(fd, 'is_featured'),
    sort: num(fd, 'sort') ?? 100,
  }

  if (id) {
    db.prepare(
      `UPDATE equipment SET title=@title, slug=@slug, manufacturer_id=@manufacturer_id, category_id=@category_id,
       model=@model, condition=@condition, year=@year, price=@price, price_on_request=@price_on_request,
       status=@status, specs=@specs, description=@description, condition_note=@condition_note, checked=@checked,
       complete_set=@complete_set, power=@power, weight=@weight, dimensions=@dimensions, images=@images,
       passport_url=@passport_url, is_published=@is_published, is_featured=@is_featured, sort=@sort,
       updated_at=datetime('now') WHERE id=@id`
    ).run({ ...payload, id })
  } else {
    db.prepare(
      `INSERT INTO equipment (title, slug, manufacturer_id, category_id, model, condition, year, price, price_on_request,
       status, specs, description, condition_note, checked, complete_set, power, weight, dimensions, images,
       passport_url, is_published, is_featured, sort)
       VALUES (@title, @slug, @manufacturer_id, @category_id, @model, @condition, @year, @price, @price_on_request,
       @status, @specs, @description, @condition_note, @checked, @complete_set, @power, @weight, @dimensions, @images,
       @passport_url, @is_published, @is_featured, @sort)`
    ).run(payload)
  }

  revalidatePath('/')
  revalidatePath('/new')
  revalidatePath('/used')
  ok('/admin/equipment', id ? 'Карточка обновлена' : 'Карточка создана')
}

export async function deleteEquipment(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM equipment WHERE id = ?').run(id)
  ok('/admin/equipment', 'Карточка удалена')
}

export async function toggleEquipmentPublished(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('UPDATE equipment SET is_published = 1 - is_published, updated_at = datetime(\'now\') WHERE id = ?').run(id)
  ok('/admin/equipment')
}

/* ---------------- posts ---------------- */

export async function savePost(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const db = getDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) fail(id ? `/admin/posts/${id}` : '/admin/posts/new', 'Заголовок обязателен')

  const payload = {
    title,
    slug: uniqueSlug('posts', str(fd, 'slug') || title, id ?? undefined),
    excerpt: str(fd, 'excerpt') || null,
    body: str(fd, 'body') || null,
    cover: str(fd, 'cover') || null,
    equipment_id: num(fd, 'equipment_id'),
    published_at: str(fd, 'published_at') || new Date().toISOString().slice(0, 10),
    is_published: bool(fd, 'is_published'),
    is_pinned: bool(fd, 'is_pinned'),
  }

  if (id) {
    db.prepare(
      `UPDATE posts SET title=@title, slug=@slug, excerpt=@excerpt, body=@body, cover=@cover,
       equipment_id=@equipment_id, published_at=@published_at, is_published=@is_published, is_pinned=@is_pinned
       WHERE id=@id`
    ).run({ ...payload, id })
  } else {
    db.prepare(
      `INSERT INTO posts (title, slug, excerpt, body, cover, equipment_id, published_at, is_published, is_pinned)
       VALUES (@title, @slug, @excerpt, @body, @cover, @equipment_id, @published_at, @is_published, @is_pinned)`
    ).run(payload)
  }
  revalidatePath('/news')
  ok('/admin/posts', 'Новость сохранена')
}

export async function deletePost(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM posts WHERE id = ?').run(id)
  ok('/admin/posts', 'Новость удалена')
}

export async function togglePostPublished(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('UPDATE posts SET is_published = 1 - is_published WHERE id = ?').run(id)
  ok('/admin/posts')
}

/* ---------------- categories / manufacturers ---------------- */

export async function saveCategory(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const db = getDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) fail('/admin/categories', 'Название обязательно')
  const payload = {
    title,
    slug: uniqueSlug('categories', str(fd, 'slug') || title, id ?? undefined),
    short_title: str(fd, 'short_title') || null,
    description: str(fd, 'description') || null,
    sort: num(fd, 'sort') ?? 100,
  }
  if (id) {
    db.prepare(
      'UPDATE categories SET title=@title, slug=@slug, short_title=@short_title, description=@description, sort=@sort WHERE id=@id'
    ).run({ ...payload, id })
  } else {
    db.prepare(
      'INSERT INTO categories (title, slug, short_title, description, sort) VALUES (@title, @slug, @short_title, @description, @sort)'
    ).run(payload)
  }
  ok('/admin/categories', 'Категория сохранена')
}

export async function deleteCategory(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM categories WHERE id = ?').run(id)
  ok('/admin/categories', 'Категория удалена')
}

export async function saveManufacturer(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const db = getDb()
  const id = num(fd, 'id')
  const name = str(fd, 'name')
  if (!name) fail('/admin/manufacturers', 'Название обязательно')
  const payload = {
    name,
    slug: uniqueSlug('manufacturers', str(fd, 'slug') || name, id ?? undefined),
    country: str(fd, 'country') || null,
    founded: str(fd, 'founded') || null,
    site_url: str(fd, 'site_url') || null,
    summary: str(fd, 'summary') || null,
    note: str(fd, 'note') || null,
    sort: num(fd, 'sort') ?? 100,
  }
  if (id) {
    db.prepare(
      `UPDATE manufacturers SET name=@name, slug=@slug, country=@country, founded=@founded, site_url=@site_url,
       summary=@summary, note=@note, sort=@sort WHERE id=@id`
    ).run({ ...payload, id })
  } else {
    db.prepare(
      `INSERT INTO manufacturers (name, slug, country, founded, site_url, summary, note, sort)
       VALUES (@name, @slug, @country, @founded, @site_url, @summary, @note, @sort)`
    ).run(payload)
  }
  ok('/admin/manufacturers', 'Производитель сохранён')
}

export async function deleteManufacturer(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM manufacturers WHERE id = ?').run(id)
  ok('/admin/manufacturers', 'Производитель удалён')
}

/* ---------------- catalogs ---------------- */

export async function saveCatalog(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const db = getDb()
  const id = num(fd, 'id')
  const title = str(fd, 'title')
  if (!title) fail('/admin/catalogs', 'Название обязательно')
  const payload = {
    title,
    manufacturer_id: num(fd, 'manufacturer_id'),
    description: str(fd, 'description') || null,
    cover: str(fd, 'cover') || null,
    pdf_url: str(fd, 'pdf_url') || null,
    pages_label: str(fd, 'pages_label') || null,
    file_size: str(fd, 'file_size') || null,
    year: num(fd, 'year'),
    sort: num(fd, 'sort') ?? 100,
  }
  if (id) {
    db.prepare(
      `UPDATE catalogs SET title=@title, manufacturer_id=@manufacturer_id, description=@description, cover=@cover,
       pdf_url=@pdf_url, pages_label=@pages_label, file_size=@file_size, year=@year, sort=@sort WHERE id=@id`
    ).run({ ...payload, id })
  } else {
    db.prepare(
      `INSERT INTO catalogs (title, manufacturer_id, description, cover, pdf_url, pages_label, file_size, year, sort)
       VALUES (@title, @manufacturer_id, @description, @cover, @pdf_url, @pages_label, @file_size, @year, @sort)`
    ).run(payload)
  }
  ok('/admin/catalogs', 'Каталог сохранён')
}

export async function deleteCatalog(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM catalogs WHERE id = ?').run(id)
  ok('/admin/catalogs', 'Каталог удалён')
}

/* ---------------- pages ---------------- */

export async function savePage(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const slug = str(fd, 'slug')
  const def = PAGE_DEFS.find((p) => p.slug === slug)
  if (!def) redirect('/admin/pages')

  const blocks: Record<string, string> = {}
  for (const field of def.fields) {
    blocks[field.key] = str(fd, `block_${field.key}`)
  }

  getDb()
    .prepare(
      `UPDATE pages SET title = ?, seo_title = ?, seo_description = ?, blocks = ?, updated_at = datetime('now') WHERE slug = ?`
    )
    .run(str(fd, 'title') || def.title, str(fd, 'seo_title'), str(fd, 'seo_description'), JSON.stringify(blocks), slug)

  revalidatePath('/')
  ok(`/admin/pages/${slug}`, 'Тексты страницы обновлены')
}

/* ---------------- requests ---------------- */

export async function updateRequest(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  const status = str(fd, 'status')
  const note = str(fd, 'manager_note')
  if (!id) ok('/admin/requests')
  getDb()
    .prepare('UPDATE requests SET status = ?, manager_note = ? WHERE id = ?')
    .run(['new', 'in_progress', 'closed'].includes(status) ? status : 'new', note || null, id)
  ok('/admin/requests', 'Заявка обновлена')
}

export async function deleteRequest(fd: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const id = num(fd, 'id')
  if (id) getDb().prepare('DELETE FROM requests WHERE id = ?').run(id)
  ok('/admin/requests', 'Заявка удалена')
}

/* ---------------- users ---------------- */

export async function saveUser(fd: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'admin') redirect('/admin')
  const db = getDb()
  const id = num(fd, 'id')
  const email = str(fd, 'email').toLowerCase()
  const name = str(fd, 'name')
  const role: Role = str(fd, 'role') === 'admin' ? 'admin' : 'editor'
  const password = str(fd, 'password')

  if (!email || !name) fail('/admin/users', 'Почта и имя обязательны')
  if (!id && password.length < 8) fail('/admin/users', 'Пароль — минимум 8 символов')

  try {
    if (id) {
      db.prepare('UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?').run(email, name, role, id)
      if (password) {
        if (password.length < 8) fail('/admin/users', 'Пароль — минимум 8 символов')
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), id)
      }
    } else {
      db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
        email,
        hashPassword(password),
        name,
        role
      )
    }
  } catch {
    fail('/admin/users', 'Пользователь с такой почтой уже есть')
  }
  ok('/admin/users', 'Пользователь сохранён')
}

export async function toggleUser(fd: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'admin') redirect('/admin')
  const id = num(fd, 'id')
  if (id && id !== admin.id) {
    getDb().prepare('UPDATE users SET is_active = 1 - is_active WHERE id = ?').run(id)
  }
  ok('/admin/users', 'Статус доступа изменён')
}

export async function deleteUser(fd: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'admin') redirect('/admin')
  const id = num(fd, 'id')
  if (id && id !== admin.id) getDb().prepare('DELETE FROM users WHERE id = ?').run(id)
  ok('/admin/users', 'Пользователь удалён')
}

/* ---------------- settings ---------------- */

const SETTING_KEYS = [
  'site_name',
  'site_tagline',
  'phone_display',
  'phone_href',
  'email',
  'address',
  'address_short',
  'work_hours',
  'telegram',
  'whatsapp',
  'map_lat',
  'map_lon',
  'logo_variant',
  'company_since',
  'legal_note',
]

export async function saveSettings(fd: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'admin') redirect('/admin')
  const db = getDb()
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  )
  for (const key of SETTING_KEYS) {
    if (fd.has(key)) upsert.run(key, str(fd, key))
  }

  const stats = [0, 1, 2, 3].map((i) => ({
    value: num(fd, `stat_value_${i}`) ?? 0,
    suffix: str(fd, `stat_suffix_${i}`),
    label: str(fd, `stat_label_${i}`),
  }))
  upsert.run('stats', JSON.stringify(stats))

  revalidatePath('/')
  ok('/admin/settings', 'Настройки сохранены')
}

export async function currentAdmin() {
  return getCurrentUser()
}

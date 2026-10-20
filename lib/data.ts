import 'server-only'
import { getDb } from './db'
import { DEFAULT_SETTINGS, PAGE_DEFS, PAGE_MAP } from './site-content'
import { parseImages, parseSpecs } from './utils'
import type {
  CatalogFile,
  Category,
  Equipment,
  EquipmentFull,
  Manufacturer,
  PageBlock,
  Post,
  RequestRow,
} from './types'

type RawEquipment = Equipment

function mapEquipment(row: RawEquipment): EquipmentFull {
  const db = getDb()
  const manufacturer = row.manufacturer_id
    ? (db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(row.manufacturer_id) as Manufacturer | undefined)
    : undefined
  const category = row.category_id
    ? (db.prepare('SELECT * FROM categories WHERE id = ?').get(row.category_id) as Category | undefined)
    : undefined
  return {
    ...row,
    specs_parsed: parseSpecs(row.specs),
    images_parsed: parseImages(row.images),
    manufacturer: manufacturer ?? null,
    category: category ?? null,
  }
}

export function getSettings(): Record<string, string> {
  const rows = getDb().prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function getStats(): { value: number; suffix: string; label: string }[] {
  const raw = getSettings().stats
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    /* noop */
  }
  return []
}

export function getPage(slug: string): PageBlock {
  const def = PAGE_MAP[slug]
  const fallback: PageBlock = {
    slug,
    title: def?.title ?? slug,
    seo_title: def?.seo_title ?? null,
    seo_description: def?.seo_description ?? null,
    blocks: def?.defaults ?? {},
  }
  const row = getDb().prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as
    | { slug: string; title: string; seo_title: string | null; seo_description: string | null; blocks: string; updated_at: string }
    | undefined
  if (!row) return fallback
  let blocks: Record<string, string> = {}
  try {
    blocks = JSON.parse(row.blocks)
  } catch {
    blocks = {}
  }
  return {
    slug: row.slug,
    title: row.title,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    blocks: { ...fallback.blocks, ...blocks },
    updated_at: row.updated_at,
  }
}

export function getCategories(): Category[] {
  return getDb().prepare('SELECT * FROM categories ORDER BY sort, id').all() as Category[]
}

export function getManufacturers(): Manufacturer[] {
  return getDb().prepare('SELECT * FROM manufacturers ORDER BY sort, id').all() as Manufacturer[]
}

export type EquipmentQuery = {
  condition?: 'new' | 'used'
  category?: string
  manufacturer?: string
  status?: string
  featured?: boolean
  limit?: number
  includeSold?: boolean
  excludeId?: number
  sort?: string
}

export function getEquipmentList(query: EquipmentQuery = {}): EquipmentFull[] {
  const db = getDb()
  const where: string[] = ['e.is_published = 1']
  const params: Record<string, unknown> = {}

  if (query.condition) {
    where.push('e.condition = @condition')
    params.condition = query.condition
  }
  if (query.category) {
    where.push('c.slug = @category')
    params.category = query.category
  }
  if (query.manufacturer) {
    where.push('m.slug = @manufacturer')
    params.manufacturer = query.manufacturer
  }
  if (query.status) {
    where.push('e.status = @status')
    params.status = query.status
  }
  if (query.featured) where.push('e.is_featured = 1')
  if (query.excludeId) {
    where.push('e.id != @excludeId')
    params.excludeId = query.excludeId
  }
  if (!query.includeSold) where.push("e.status != 'sold'")

  const limit = query.limit ? `LIMIT ${Math.max(1, Math.min(100, query.limit))}` : ''
  const orderBy =
    query.sort === 'price_asc'
      ? 'CASE WHEN e.price IS NULL THEN 1 ELSE 0 END, e.price ASC, e.sort'
      : query.sort === 'price_desc'
        ? 'CASE WHEN e.price IS NULL THEN 1 ELSE 0 END, e.price DESC, e.sort'
        : query.sort === 'year'
          ? 'e.year DESC, e.sort'
          : 'e.sort, e.id'

  const rows = db
    .prepare(
      `SELECT e.* FROM equipment e
       LEFT JOIN categories c ON c.id = e.category_id
       LEFT JOIN manufacturers m ON m.id = e.manufacturer_id
       WHERE ${where.join(' AND ')}
       ORDER BY ${orderBy} ${limit}`
    )
    .all(params) as RawEquipment[]

  return rows.map(mapEquipment)
}

export function getEquipmentBySlug(slug: string): EquipmentFull | null {
  const row = getDb().prepare('SELECT * FROM equipment WHERE slug = ? AND is_published = 1').get(slug) as
    | RawEquipment
    | undefined
  return row ? mapEquipment(row) : null
}

export function getEquipmentById(id: number): EquipmentFull | null {
  const row = getDb().prepare('SELECT * FROM equipment WHERE id = ?').get(id) as RawEquipment | undefined
  return row ? mapEquipment(row) : null
}

export function getEquipmentBySlugs(slugs: string[]): EquipmentFull[] {
  if (!slugs.length) return []
  const clean = slugs.slice(0, 3)
  const placeholders = clean.map(() => '?').join(',')
  const rows = getDb()
    .prepare(`SELECT * FROM equipment WHERE slug IN (${placeholders}) AND is_published = 1`)
    .all(...clean) as RawEquipment[]
  const mapped = rows.map(mapEquipment)
  return clean.map((slug) => mapped.find((e) => e.slug === slug)).filter(Boolean) as EquipmentFull[]
}

export function getCategoryCounts(condition?: 'new' | 'used'): Record<string, number> {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT c.slug as slug, COUNT(*) as n FROM equipment e
       JOIN categories c ON c.id = e.category_id
       WHERE e.is_published = 1 AND e.status != 'sold'${condition ? ' AND e.condition = @condition' : ''}
       GROUP BY c.slug`
    )
    .all(condition ? { condition } : {}) as { slug: string; n: number }[]
  return Object.fromEntries(rows.map((r) => [r.slug, r.n]))
}

export function countEquipment(condition?: 'new' | 'used'): number {
  const row = getDb()
    .prepare(
      condition
        ? 'SELECT COUNT(*) as n FROM equipment WHERE is_published = 1 AND condition = ? AND status != \'sold\''
        : "SELECT COUNT(*) as n FROM equipment WHERE is_published = 1 AND status != 'sold'"
    )
    .get(...(condition ? [condition] : [])) as { n: number }
  return row.n
}

/** Только то, что физически стоит на складе: без «в пути», брони и заказа. */
export function countInStock(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as n FROM equipment WHERE is_published = 1 AND status = 'in_stock'")
    .get() as { n: number }
  return row.n
}

export function getPriceRange(condition?: 'new' | 'used'): { min: number; max: number } {
  const row = getDb()
    .prepare(
      `SELECT MIN(price) as min, MAX(price) as max FROM equipment
       WHERE is_published = 1 AND price IS NOT NULL AND status != 'sold'${condition ? ' AND condition = @condition' : ''}`
    )
    .get(condition ? { condition } : {}) as { min: number | null; max: number | null }
  return { min: row.min ?? 0, max: row.max ?? 0 }
}

export function getPosts(limit?: number): Post[] {
  const lim = limit ? `LIMIT ${Math.max(1, Math.min(50, limit))}` : ''
  return getDb()
    .prepare(`SELECT * FROM posts WHERE is_published = 1 ORDER BY is_pinned DESC, published_at DESC, id DESC ${lim}`)
    .all() as Post[]
}

export function getPostBySlug(slug: string): Post | null {
  return (
    (getDb().prepare('SELECT * FROM posts WHERE slug = ? AND is_published = 1').get(slug) as Post | undefined) ?? null
  )
}

export function getCatalogs(): (CatalogFile & { manufacturer: Manufacturer | null })[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM catalogs ORDER BY sort, id').all() as CatalogFile[]
  return rows.map((row) => ({
    ...row,
    manufacturer: row.manufacturer_id
      ? ((db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(row.manufacturer_id) as Manufacturer | undefined) ??
        null)
      : null,
  }))
}

export function getRelatedEquipment(item: EquipmentFull, limit = 3): EquipmentFull[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT * FROM equipment
       WHERE is_published = 1 AND status != 'sold' AND id != @id
         AND (category_id = @categoryId OR condition = @condition)
       ORDER BY (category_id = @categoryId) DESC, sort
       LIMIT @limit`
    )
    .all({ id: item.id, categoryId: item.category_id, condition: item.condition, limit }) as RawEquipment[]
  return rows.map(mapEquipment)
}

export function getRequests(limit = 200): (RequestRow & { equipment_title: string | null })[] {
  return getDb()
    .prepare(
      `SELECT r.*, e.title as equipment_title FROM requests r
       LEFT JOIN equipment e ON e.id = r.equipment_id
       ORDER BY r.created_at DESC, r.id DESC LIMIT ?`
    )
    .all(limit) as (RequestRow & { equipment_title: string | null })[]
}

export function getRequestStats() {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'new') as fresh,
         SUM(status = 'in_progress') as in_progress,
         SUM(status = 'closed') as closed,
         SUM(date(created_at) = date('now')) as today
       FROM requests`
    )
    .get() as { total: number; fresh: number | null; in_progress: number | null; closed: number | null; today: number | null }
  return {
    total: row.total ?? 0,
    fresh: row.fresh ?? 0,
    in_progress: row.in_progress ?? 0,
    closed: row.closed ?? 0,
    today: row.today ?? 0,
  }
}

export function getAdminCounts() {
  const db = getDb()
  const equipmentRow = db.prepare('SELECT COUNT(*) as n FROM equipment').get() as { n: number }
  const usedRow = db.prepare("SELECT COUNT(*) as n FROM equipment WHERE condition = 'used'").get() as { n: number }
  const postsRow = db.prepare('SELECT COUNT(*) as n FROM posts').get() as { n: number }
  return {
    equipment: equipmentRow.n,
    used: usedRow.n,
    posts: postsRow.n,
    requests: getRequestStats(),
  }
}

export function getAllPages() {
  const db = getDb()
  const rows = db.prepare('SELECT slug, title, updated_at FROM pages ORDER BY rowid').all() as {
    slug: string
    title: string
    updated_at: string
  }[]
  return PAGE_DEFS.map((def) => rows.find((r) => r.slug === def.slug) ?? { slug: def.slug, title: def.title, updated_at: '' })
}

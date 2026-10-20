import type { DB } from './db'
import { hashPassword } from './password'
import {
  categories as seedCategories,
  manufacturers as seedManufacturers,
  equipment as seedEquipment,
  posts as seedPosts,
  catalogs as seedCatalogs,
} from './seed-content'
import { DEFAULT_SETTINGS, PAGE_DEFS } from './site-content'

export function seedDatabase(db: DB) {
  const insertCategory = db.prepare(
    'INSERT INTO categories (slug, title, short_title, description, sort) VALUES (?, ?, ?, ?, ?)'
  )
  const insertManufacturer = db.prepare(
    'INSERT INTO manufacturers (slug, name, country, founded, site_url, summary, note, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )

  const tx = db.transaction(() => {
    for (const c of seedCategories) insertCategory.run(c.slug, c.title, c.short_title, c.description, c.sort)
    for (const m of seedManufacturers)
      insertManufacturer.run(m.slug, m.name, m.country, m.founded, m.site_url, m.summary, m.note, m.sort)

    const catIds = new Map(
      (db.prepare('SELECT id, slug FROM categories').all() as { id: number; slug: string }[]).map((r) => [r.slug, r.id])
    )
    const manIds = new Map(
      (db.prepare('SELECT id, slug FROM manufacturers').all() as { id: number; slug: string }[]).map((r) => [r.slug, r.id])
    )

    const insertEquipment = db.prepare(`
      INSERT INTO equipment
        (slug, title, manufacturer_id, category_id, model, condition, year, price, price_on_request, status,
         specs, description, condition_note, checked, complete_set, power, weight, dimensions, images,
         passport_url, is_published, is_featured, sort)
      VALUES (@slug, @title, @manufacturer_id, @category_id, @model, @condition, @year, @price, @price_on_request, @status,
         @specs, @description, @condition_note, @checked, @complete_set, @power, @weight, @dimensions, @images,
         @passport_url, 1, @is_featured, @sort)
    `)

    const equipmentIds = new Map<string, number>()
    for (const e of seedEquipment) {
      const info = insertEquipment.run({
        slug: e.slug,
        title: e.title,
        manufacturer_id: manIds.get(e.manufacturer) ?? null,
        category_id: catIds.get(e.category) ?? null,
        model: e.model,
        condition: e.condition,
        year: e.year,
        price: e.price,
        price_on_request: e.price_on_request,
        status: e.status,
        specs: JSON.stringify(e.specs.map(([label, value]) => ({ label, value }))),
        description: e.description,
        condition_note: e.condition_note,
        checked: e.checked,
        complete_set: e.complete_set,
        power: e.power,
        weight: e.weight,
        dimensions: e.dimensions,
        images: JSON.stringify(e.images),
        passport_url: e.passport_url,
        is_featured: e.is_featured,
        sort: e.sort,
      })
      equipmentIds.set(e.slug, Number(info.lastInsertRowid))
    }

    const insertPost = db.prepare(`
      INSERT INTO posts (slug, title, excerpt, body, cover, equipment_id, published_at, is_published, is_pinned)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `)
    for (const p of seedPosts) {
      insertPost.run(
        p.slug,
        p.title,
        p.excerpt,
        p.body,
        p.cover,
        p.equipment ? equipmentIds.get(p.equipment) ?? null : null,
        p.published_at,
        p.is_pinned
      )
    }

    const insertCatalog = db.prepare(`
      INSERT INTO catalogs (title, manufacturer_id, description, cover, pdf_url, pages_label, file_size, year, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const c of seedCatalogs) {
      insertCatalog.run(
        c.title,
        manIds.get(c.manufacturer) ?? null,
        c.description,
        c.cover,
        c.pdf_url,
        c.pages_label,
        c.file_size,
        c.year,
        c.sort
      )
    }

    const insertPage = db.prepare(`
      INSERT INTO pages (slug, title, seo_title, seo_description, blocks) VALUES (?, ?, ?, ?, ?)
    `)
    for (const p of PAGE_DEFS) {
      insertPage.run(p.slug, p.title, p.seo_title, p.seo_description, JSON.stringify(p.defaults))
    }

    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(key, value)

    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    )
    insertUser.run('admin@vip-service23.ru', hashPassword('VipService2026!'), 'Сергей Ковалёв', 'admin')
    insertUser.run('editor@vip-service23.ru', hashPassword('Redaktor2026!'), 'Анна Литвинова', 'editor')
  })

  tx()
}

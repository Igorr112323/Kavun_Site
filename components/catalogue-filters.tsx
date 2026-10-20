'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { Category, Manufacturer } from '@/lib/types'

type Props = {
  categories: Category[]
  manufacturers: Manufacturer[]
  total: number
  allTotal?: number
  counts?: Record<string, number>
}

export function CatalogueFilters({ categories, manufacturers, total, allTotal, counts }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const category = params.get('category') ?? ''
  const manufacturer = params.get('manufacturer') ?? ''
  const sort = params.get('sort') ?? 'default'
  const hasFilters = Boolean(category || manufacturer || (sort && sort !== 'default'))

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'default') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="filters" data-pending={pending ? 'true' : undefined}>
      <div className="container filters__inner">
        <div className="filters__group" role="group" aria-label="Категория оборудования">
          <button
            type="button"
            className="chip"
            aria-pressed={!category}
            onClick={() => update('category', '')}
          >
            Все
            <small>{allTotal ?? total}</small>
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className="chip"
              aria-pressed={category === c.slug}
              onClick={() => update('category', c.slug)}
            >
              {c.short_title || c.title}
              {counts && counts[c.slug] != null ? <small>{counts[c.slug]}</small> : null}
            </button>
          ))}
        </div>

        <select
          className="filters__select"
          aria-label="Производитель"
          value={manufacturer}
          onChange={(e) => update('manufacturer', e.target.value)}
        >
          <option value="">Все производители</option>
          {manufacturers.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="filters__select"
          aria-label="Сортировка"
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
        >
          <option value="default">По порядку склада</option>
          <option value="year">Сначала свежие</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
        </select>

        <span className="filters__spacer" />
        <span className="filters__count" aria-live="polite">
          {pending ? 'Обновляем…' : <>Найдено: <b>{total}</b></>}
        </span>
        {hasFilters && (
          <button type="button" className="filters__reset" onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}>
            Сбросить
          </button>
        )}
      </div>
    </div>
  )
}

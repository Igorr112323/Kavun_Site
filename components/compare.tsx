'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { CompareIcon, CloseIcon } from './icons'

type CompareItem = { slug: string; title: string }
const KEY = 'vs_compare_v1'
const EVENT = 'vs-compare-change'

function read(): CompareItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((i) => i && typeof i.slug === 'string').slice(0, 3)
  } catch {
    return []
  }
}

function write(items: CompareItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 3)))
  window.dispatchEvent(new Event(EVENT))
}

export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>([])

  useEffect(() => {
    setItems(read())
    const sync = () => setItems(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback((item: CompareItem) => {
    const current = read()
    const exists = current.some((i) => i.slug === item.slug)
    const next = exists ? current.filter((i) => i.slug !== item.slug) : [...current, item].slice(-3)
    write(next)
  }, [])

  const remove = useCallback((slug: string) => {
    write(read().filter((i) => i.slug !== slug))
  }, [])

  const clear = useCallback(() => write([]), [])

  return { items, toggle, remove, clear }
}

export function CompareToggle({ slug, title }: { slug: string; title: string }) {
  const { items, toggle } = useCompare()
  const active = items.some((i) => i.slug === slug)
  return (
    <button
      type="button"
      className="compare-toggle"
      aria-pressed={active}
      title={active ? 'Убрать из сравнения' : 'Добавить к сравнению'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle({ slug, title })
      }}
    >
      <CompareIcon size={11} />
      {active ? 'В сравнении' : 'Сравнить'}
    </button>
  )
}

export function CompareBar() {
  const { items, clear } = useCompare()
  if (!items.length) return null
  return (
    <div className="compare-bar" role="region" aria-label="Сравнение оборудования">
      <div className="compare-bar__info">
        <b>{items.length} / 3</b>
        <span>в сравнении</span>
      </div>
      <div className="compare-bar__names">{items.map((i) => i.title).join(' · ')}</div>
      <Link className="btn btn--primary" href={`/compare?ids=${items.map((i) => i.slug).join(',')}`}>
        Сравнить
        <CompareIcon size={14} />
      </Link>
      <button type="button" className="compare-bar__clear" onClick={clear}>
        Очистить
      </button>
    </div>
  )
}

export function CompareRemove({ slug, rest }: { slug: string; rest: string[] }) {
  const { remove } = useCompare()
  const next = rest.filter((s) => s !== slug)
  return (
    <Link
      href={next.length ? `/compare?ids=${next.join(',')}` : '/compare'}
      className="compare-remove"
      onClick={() => remove(slug)}
    >
      <CloseIcon size={11} /> Убрать
    </Link>
  )
}

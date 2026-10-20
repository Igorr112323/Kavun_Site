import Link from 'next/link'
import type { ReactNode } from 'react'

export type Crumb = { href?: string; label: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Хлебные крошки">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          {i > 0 && <span className="crumbs__sep">/</span>}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function PageHead({
  crumbs,
  title,
  lead,
  meta,
}: {
  crumbs: Crumb[]
  title: ReactNode
  lead?: string
  meta?: { label: string; value: string }[]
}) {
  return (
    <section className="page-head">
      <div className="container page-head__inner">
        <Breadcrumbs items={crumbs} />
        <div className="page-head__title">
          <h1>{title}</h1>
          {lead && <p className="page-head__lead">{lead}</p>}
        </div>
        {meta && meta.length > 0 && (
          <div className="page-head__meta">
            {meta.map((m) => (
              <div key={m.label}>
                <span>{m.label}</span>
                <b>{m.value}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

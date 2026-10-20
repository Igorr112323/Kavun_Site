import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function AdminHead({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="admin-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="admin-head__actions">{actions}</div>}
    </div>
  )
}

export function Flash({ saved, error }: { saved?: string; error?: string }) {
  if (!saved && !error) return null
  return (
    <div
      className={cn('admin-note', !error && 'admin-note--info')}
      style={{ marginBottom: 18 }}
      role="status"
    >
      {error ? error : saved}
    </div>
  )
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="admin-toolbar">{children}</div>
}

export function BackLink({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="admin-link">
      ← {children ?? 'Назад'}
    </Link>
  )
}

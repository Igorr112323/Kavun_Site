'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Logo } from './logo'
import { logoutAction } from '@/lib/actions/admin'
import { cn } from '@/lib/utils'

type Counts = {
  equipment: number
  posts: number
  fresh: number
}

type User = { name: string; email: string; role: 'admin' | 'editor' }

const GROUPS = [
  {
    title: 'Склад',
    items: [
      { href: '/admin', label: 'Сводка', exact: true },
      { href: '/admin/equipment', label: 'Оборудование', badge: 'equipment' },
      { href: '/admin/categories', label: 'Категории' },
      { href: '/admin/manufacturers', label: 'Производители' },
    ],
  },
  {
    title: 'Контент',
    items: [
      { href: '/admin/posts', label: 'Новости', badge: 'posts' },
      { href: '/admin/catalogs', label: 'Каталоги PDF' },
      { href: '/admin/pages', label: 'Тексты страниц' },
    ],
  },
  {
    title: 'Клиенты',
    items: [{ href: '/admin/requests', label: 'Заявки', badge: 'fresh' }],
  },
  {
    title: 'Система',
    items: [
      { href: '/admin/users', label: 'Пользователи', adminOnly: true },
      { href: '/admin/settings', label: 'Настройки сайта', adminOnly: true },
    ],
  },
]

export function AdminShell({
  children,
  user,
  counts,
}: {
  children: ReactNode
  user: User
  counts: Counts
}) {
  const pathname = usePathname()

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <Link href="/admin" aria-label="Vip-service — админка">
            <Logo compact />
          </Link>
          <span className="label">CMS</span>
        </div>

        <nav className="admin-nav" aria-label="Разделы админки">
          {GROUPS.map((group) => {
            const items = group.items.filter((item) => !('adminOnly' in item && item.adminOnly) || user.role === 'admin')
            if (!items.length) return null
            return (
              <div key={group.title} style={{ display: 'contents' }}>
                <span className="admin-nav__group">{group.title}</span>
                {items.map((item) => {
                  const isActive =
                    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                  const badge = 'badge' in item && item.badge ? counts[item.badge as keyof Counts] : undefined
                  return (
                    <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined}>
                      {item.label}
                      {badge ? <b>{badge}</b> : null}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="admin-side__foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-signout" style={{ textAlign: 'center' }}>
            Открыть сайт ↗
          </a>
          <div className="admin-user">
            <b>{user.name}</b>
            <span>{user.role === 'admin' ? 'администратор' : 'контент-менеджер'}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className={cn('admin-signout')} style={{ width: '100%' }}>
              Выйти
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-main__inner">{children}</div>
      </div>
    </div>
  )
}

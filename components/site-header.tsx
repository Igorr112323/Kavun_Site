'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Logo } from './logo'
import { NAV } from '@/lib/site-content'
import { cn } from '@/lib/utils'
import { ArrowIcon, MailIcon, PhoneIcon, PinIcon } from './icons'

type Settings = Record<string, string>

const PRODUCT_LINKS = [
  {
    href: '/new',
    title: 'Новое оборудование',
    text: 'Центры, пилы, сварка. Наличие в Краснодаре и сроки под заказ.',
  },
  {
    href: '/used',
    title: 'Б/У с проверкой',
    text: 'Запущены под нагрузкой, с гарантией 3 месяца и честным описанием.',
  },
  {
    href: '/catalogs',
    title: 'Каталоги производителей',
    text: 'PDF elumatec, Emmegi, Stürtz, Haffner — без регистрации.',
  },
]

export function SiteHeader({ settings, logoVariant }: { settings: Settings; logoVariant: string }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)
  const megaBtnRef = useRef<HTMLButtonElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMega(false)
    setMobile(false)
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('is-locked', mobile)
    return () => document.body.classList.remove('is-locked')
  }, [mobile])

  const closeMega = useCallback(() => setMega(false), [])

  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMega(false)
        megaBtnRef.current?.focus()
      }
      if (e.key === 'Tab' && megaRef.current) {
        const focusables = megaRef.current.querySelectorAll<HTMLElement>('a[href], button')
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (megaRef.current?.contains(target) || megaBtnRef.current?.contains(target)) return
      closeMega()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [mega, closeMega])

  useEffect(() => {
    if (!mobile) return
    const panel = mobileRef.current
    panel?.querySelector<HTMLElement>('button, a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobile(false)
        burgerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button')
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobile])

  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setMega(true)
  }
  const delayCloseMega = () => {
    megaTimer.current = setTimeout(() => setMega(false), 140)
  }

  const mainNav = NAV.filter((item) => ['/service', '/logistics', '/company', '/contacts'].includes(item.href))

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__group">
            <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer">
              {settings.address_short}
            </a>
            <span className="topbar__dot">{settings.work_hours}</span>
          </div>
          <div className="topbar__group">
            <span className="topbar__coords">
              {settings.map_lat} N / {settings.map_lon} E
            </span>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>
        </div>
      </div>

      <header className={cn('site-header', scrolled && 'is-scrolled')}>
        <div className="container header__inner">
          <Link href="/" aria-label={`${settings.site_name} — на главную`}>
            <Logo variant={logoVariant} />
          </Link>

          <nav className="nav" aria-label="Основная навигация">
            <button
              ref={megaBtnRef}
              type="button"
              className="nav__link"
              aria-expanded={mega}
              aria-controls="mega-products"
              onClick={() => setMega((v) => !v)}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') openMega()
              }}
              onPointerLeave={() => {
                if (window.matchMedia('(hover: hover)').matches) delayCloseMega()
              }}
            >
              Оборудование
              <span className="nav__caret" aria-hidden="true" />
            </button>

            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav__link"
                aria-current={pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined}
              >
                {item.short}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <div className="header__phone">
              <a href={`tel:${settings.phone_href}`}>{settings.phone_display}</a>
              <span>звонок · без выходных</span>
            </div>
            <div className="header__cta">
              <Link href="/contacts#zayavka" className="btn btn--primary">
                Запросить КП
                <span className="btn__arrow" aria-hidden="true" />
              </Link>
            </div>
            <button
              ref={burgerRef}
              type="button"
              className="burger"
              aria-label="Открыть меню"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <span />
            </button>
          </div>
        </div>

        {mega && (
          <div
            className="mega"
            id="mega-products"
            ref={megaRef}
            onPointerEnter={openMega}
            onPointerLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) delayCloseMega()
            }}
          >
            <div className="container mega__inner">
              <div className="mega__col">
                <span className="mega__title">Оборудование и документы</span>
                {PRODUCT_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} className="mega__item" onClick={closeMega}>
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </Link>
                ))}
              </div>
              <div className="mega__note">
                <span className="mega__title">Если модели нет на сайте</span>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(236,233,225,.62)', margin: 0 }}>
                  Пришлите фото шильдика или название системы — найдём станок у производителя и посчитаем срок с
                  доставкой до Краснодара.
                </p>
                <a href={`tel:${settings.phone_href}`} className="btn btn--ghost btn--sm" style={{ justifySelf: 'start' }}>
                  <PhoneIcon size={14} />
                  {settings.phone_display}
                </a>
                <Link href="/contacts#zayavka" className="textlink" style={{ color: 'var(--paper)', alignSelf: 'start' }} onClick={closeMega}>
                  Оставить заявку
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {mounted &&
        mobile &&
        createPortal(
          <div className="mmenu" role="dialog" aria-modal="true" aria-label="Меню сайта" ref={mobileRef}>
            <div className="mmenu__top">
              <Link href="/" onClick={() => setMobile(false)} aria-label="На главную">
                <Logo variant={logoVariant} compact />
              </Link>
              <button type="button" className="mmenu__close" onClick={() => setMobile(false)} aria-label="Закрыть меню">
                Закрыть
              </button>
            </div>
            <nav className="mmenu__nav" aria-label="Мобильная навигация">
              {NAV.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mmenu__link"
                  style={{ '--i': i } as React.CSSProperties}
                  onClick={() => setMobile(false)}
                >
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mmenu__bottom">
              <a href={`tel:${settings.phone_href}`} className="mmenu__phone">
                {settings.phone_display}
              </a>
              <a href={`mailto:${settings.email}`} className="label" style={{ color: 'rgba(236,233,225,.6)' }}>
                <MailIcon size={13} style={{ display: 'inline', marginRight: 6 }} />
                {settings.email}
              </a>
              <span className="label" style={{ color: 'rgba(236,233,225,.42)', display: 'flex', gap: 8 }}>
                <PinIcon size={13} />
                {settings.address}
              </span>
              <Link href="/contacts#zayavka" className="btn btn--primary" onClick={() => setMobile(false)}>
                Запросить КП
                <span className="btn__arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

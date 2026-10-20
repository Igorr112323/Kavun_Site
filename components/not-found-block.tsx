import Link from 'next/link'
import { ArrowIcon } from './icons'

export function NotFoundBlock() {
  return (
    <section className="notfound">
      <div className="container" style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
        <span className="notfound__code">404</span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Такой страницы нет</h1>
        <p className="muted" style={{ maxWidth: '44ch', fontSize: 15 }}>
          Возможно, станок уже продан и карточку сняли — или в ссылке опечатка. Начните с каталога: он обновляется
          вручную и совпадает со складом.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" className="btn btn--ink">
            На главную
            <ArrowIcon size={12} />
          </Link>
          <Link href="/used" className="btn btn--ghost">
            Что на складе
          </Link>
        </div>
      </div>
    </section>
  )
}

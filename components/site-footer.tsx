import Link from 'next/link'
import { Logo } from './logo'
import { NAV } from '@/lib/site-content'
import { MailIcon, PhoneIcon, PinIcon, ClockIcon, TelegramIcon, WhatsAppIcon } from './icons'

export function SiteFooter({ settings, logoVariant }: { settings: Record<string, string>; logoVariant: string }) {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer__top">
        <div className="footer__wordmark" aria-hidden="true">
          <div>
            Vip<span>—</span>service
          </div>
          <small>с {settings.company_since} года · краснодар</small>
        </div>

        <div className="footer__grid">
          <div className="footer__col">
            <Logo variant={logoVariant} compact />
            <a href={`tel:${settings.phone_href}`} className="footer__phone">
              {settings.phone_display}
            </a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <a href={settings.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="tag tag--plain" style={{ color: 'rgba(236,233,225,.7)', borderColor: 'var(--line-dark-strong)' }}>
                <TelegramIcon size={13} />
                Telegram
              </a>
              <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="tag tag--plain" style={{ color: 'rgba(236,233,225,.7)', borderColor: 'var(--line-dark-strong)' }}>
                <WhatsAppIcon size={13} />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="footer__col">
            <span className="footer__title">Оборудование</span>
            <Link href="/new">Новое оборудование</Link>
            <Link href="/used">Б/У с проверкой</Link>
            <Link href="/catalogs">Каталоги PDF</Link>
            <Link href="/compare">Сравнение станков</Link>
            <Link href="/news">Новости и поступления</Link>
          </div>

          <div className="footer__col">
            <span className="footer__title">Компания</span>
            {NAV.filter((n) => ['/service', '/logistics', '/company', '/contacts'].includes(n.href)).map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/privacy">Политика конфиденциальности</Link>
          </div>

          <div className="footer__col">
            <span className="footer__title">Склад и сервис</span>
            <p className="footer__addr">
              <PinIcon size={13} className="inline-icon" />
              {settings.address}
            </p>
            <p>
              <ClockIcon size={13} className="inline-icon" />
              {settings.work_hours}
            </p>
            <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer">
              Схема проезда →
            </a>
            <p className="footer__note">{settings.legal_note}</p>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} {settings.site_name}</span>
          <span>Цены и наличие не являются публичной офертой</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <a href={`tel:${settings.phone_href}`}>
              <PhoneIcon size={11} className="inline-icon" /> {settings.phone_display}
            </a>
            <a href={`mailto:${settings.email}`}>
              <MailIcon size={11} className="inline-icon" /> Написать
            </a>
            <Link href="/admin">Админка</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

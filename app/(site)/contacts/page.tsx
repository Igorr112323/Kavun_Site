import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { MapScheme } from '@/components/map-scheme'
import { LeadForm } from '@/components/lead-form'
import { Reveal } from '@/components/reveal'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { ArrowIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, TelegramIcon, WhatsAppIcon } from '@/components/icons'
import { getPage, getSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { safePhone } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('contacts', '/contacts')
}

export default function ContactsPage() {
  const page = getPage('contacts')
  const b = page.blocks
  const settings = getSettings()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Контакты', path: '/contacts' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Контакты' },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'Телефон', value: settings.phone_display },
          { label: 'Склад', value: 'Полевая, 43' },
          { label: 'Часы', value: 'Пн–Пт 8:30–18:00' },
        ]}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="contact-grid">
            <div className="kv">
              <div className="kv__row">
                <span className="label">Телефон</span>
                <a href={`tel:${safePhone(settings.phone_href)}`} className="kv__big">
                  {settings.phone_display}
                </a>
                <span className="form-note">Сервис, продажи и логистика — один номер. Спросите нужного человека.</span>
              </div>
              <div className="kv__row">
                <span className="label">Почта</span>
                <a href={`mailto:${settings.email}`} className="kv__value">
                  {settings.email}
                </a>
                <span className="form-note">Для КП, спецификаций и заявок на ремонт. Отвечаем в рабочее время.</span>
              </div>
              <div className="kv__row">
                <span className="label">Мессенджеры</span>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                  <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                    <TelegramIcon size={14} />
                    Telegram
                  </a>
                  <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                    <WhatsAppIcon size={14} />
                    WhatsApp
                  </a>
                </div>
                <span className="form-note">Можно прислать фото шильдика или ошибки на экране — так быстрее.</span>
              </div>
              <div className="kv__row">
                <span className="label">Адрес</span>
                <span className="kv__value" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <PinIcon size={15} className="inline-icon" />
                  {settings.address}
                </span>
                <span className="form-note">Склад, сервис и мастерская — на одной площадке. Ворота № 3.</span>
              </div>
              <div className="kv__row">
                <span className="label">Часы работы</span>
                <span className="kv__value" style={{ display: 'flex', gap: 8 }}>
                  <ClockIcon size={14} className="inline-icon" />
                  {settings.work_hours}
                </span>
                <span className="form-note">Станки можно смотреть в будни до 18:00, в субботу — до 14:00. Лучше позвонить заранее.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <MapScheme address={settings.address} />
              <div className="route-note">
                <span className="label label--accent">Как добраться</span>
                <p>{b.route_note}</p>
                <p className="form-note">{b.parking_note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--dark" id="zayavka">
        <div className="container">
          <div className="split split--form">
            <div>
              <span className="label label--accent">Заявка</span>
              <h2 style={{ marginTop: 12 }}>Напишите — ответим по существу</h2>
              <p className="lead" style={{ marginTop: 16 }}>
                Одна заявка — один ответ. Без рассылок и «менеджер свяжется с вами в течение трёх дней»: если написали в
                рабочее время, ответ будет в течение двух часов.
              </p>
              <div className="contact-rows" style={{ marginTop: 26 }}>
                <div className="contact-row">
                  <span className="contact-row__label">Телефон</span>
                  <span className="contact-row__value contact-row__value--big">
                    <a href={`tel:${safePhone(settings.phone_href)}`}>{settings.phone_display}</a>
                  </span>
                </div>
                <div className="contact-row">
                  <span className="contact-row__label">Почта</span>
                  <span className="contact-row__value">
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </span>
                </div>
                <div className="contact-row">
                  <span className="contact-row__label">Реквизиты</span>
                  <span className="contact-row__value" style={{ fontSize: 13 }}>
                    {settings.legal_note}
                  </span>
                </div>
              </div>
              <Link href="/company" className="textlink" style={{ marginTop: 22 }}>
                О компании и складе
                <ArrowIcon size={12} />
              </Link>
            </div>
            <LeadForm source="/contacts" title="Заявка" subtitle="Ответ в течение 2 часов" cta="Отправить" />
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 22 }}>
        <div className="label" style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <span><PhoneIcon size={12} className="inline-icon" /> {settings.phone_display}</span>
          <span><MailIcon size={12} className="inline-icon" /> {settings.email}</span>
          <span><PinIcon size={12} className="inline-icon" /> {settings.address}</span>
        </div>
      </div>
    </>
  )
}

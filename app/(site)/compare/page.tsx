import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { CompareRemove } from '@/components/compare'
import { ArrowIcon } from '@/components/icons'
import { getEquipmentBySlugs } from '@/lib/data'
import { CONDITION_LABEL, STATUS_LABEL, formatPrice } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('new', '/compare', {
    title: 'Сравнение станков · Vip-service',
    description: 'Сравните до трёх станков по характеристикам, состоянию и цене.',
    robots: { index: false, follow: false },
  })
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const slugs = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
  const items = getEquipmentBySlugs(slugs)

  const specLabels: string[] = []
  items.forEach((item) => {
    item.specs_parsed.forEach((s) => {
      if (!specLabels.includes(s.label)) specLabels.push(s.label)
    })
  })

  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Сравнение' },
        ]}
        title="Сравнение станков"
        lead="До трёх машин рядом: характеристики, состояние и цена. Ссылку можно отправить коллеге или сохранить в закладки."
        meta={[
          { label: 'Выбрано', value: `${items.length} из 3` },
          { label: 'Источник данных', value: 'склад, Краснодар' },
        ]}
      />

      <section className="section section--tight">
        <div className="container">
          {items.length === 0 ? (
            <div className="empty">
              <span className="label label--accent">Пусто</span>
              <h2 style={{ fontSize: '1.8rem' }}>Пока нечего сравнивать</h2>
              <p className="muted" style={{ fontSize: 14 }}>
                Откройте каталог и нажмите «Сравнить» на карточках — до трёх машин. Кнопка появится на карточке при
                наведении и в карточке товара.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/new" className="btn btn--ink btn--sm">
                  Новое оборудование
                  <ArrowIcon size={12} />
                </Link>
                <Link href="/used" className="btn btn--ghost btn--sm">
                  Б/У с проверкой
                </Link>
              </div>
            </div>
          ) : (
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ background: 'var(--paper-3)' }}>
                      <span className="label">Параметр</span>
                    </th>
                    {items.map((item) => (
                      <th scope="col" key={item.id}>
                        <div className="compare-col">
                          <div className="compare-col__img">
                            <Image
                              src={item.images_parsed[0] || '/images/profiles.jpg'}
                              alt={item.title}
                              width={440}
                              height={330}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="compare-col__body">
                            <span>{item.manufacturer?.name}</span>
                            <b>{item.model ?? item.title}</b>
                            <Link href={`/equipment/${item.slug}`}>Открыть карточку →</Link>
                            <CompareRemove slug={item.slug} rest={items.map((i) => i.slug)} />
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Цена</th>
                    {items.map((item) => (
                      <td key={item.id}>{item.price_on_request || item.price == null ? 'по запросу' : formatPrice(item.price)}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Состояние</th>
                    {items.map((item) => (
                      <td key={item.id}>{CONDITION_LABEL[item.condition]}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Наличие</th>
                    {items.map((item) => (
                      <td key={item.id}>{STATUS_LABEL[item.status]}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Год</th>
                    {items.map((item) => (
                      <td key={item.id}>{item.year ?? '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Производитель</th>
                    {items.map((item) => (
                      <td key={item.id}>{item.manufacturer?.name ?? '—'}</td>
                    ))}
                  </tr>
                  {specLabels.map((label) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {items.map((item) => (
                        <td key={item.id}>{item.specs_parsed.find((s) => s.label === label)?.value ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Проверено</th>
                    {items.map((item) => (
                      <td key={item.id}>{item.checked ? 'да, механиком' : 'новое, в пломбах'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="contact-strip" style={{ marginTop: 32 }}>
              <div>
                <span className="label label--accent">Что дальше</span>
                <h2 style={{ marginTop: 10 }}>Покажем выбранные машины в работе</h2>
                <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
                  Запустим при вас, дадим порезать ваш профиль и посчитать окупаемость. Приезжайте или закажите видео —
                  снимем на телефон без монтажа.
                </p>
              </div>
              <div className="contact-strip__actions">
                <Link href="/contacts#zayavka" className="btn btn--primary">
                  Записаться на осмотр
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

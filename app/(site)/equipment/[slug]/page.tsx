import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/page-head'
import { Gallery } from '@/components/gallery'
import { LeadForm } from '@/components/lead-form'
import { CompareToggle } from '@/components/compare'
import { EquipmentCard } from '@/components/equipment-card'
import { Reveal } from '@/components/reveal'
import { ConditionTag, StatusTag } from '@/components/status-tag'
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/jsonld'
import { ArrowIcon, CheckIcon, DocIcon, PhoneIcon, ShieldIcon, TruckIcon, WrenchIcon } from '@/components/icons'
import { getEquipmentBySlug, getRelatedEquipment, getSettings } from '@/lib/data'
import { CONDITION_LABEL, STATUS_LABEL, formatDate, formatPrice, safePhone } from '@/lib/utils'
import { absoluteUrl, buildMetadata } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getEquipmentBySlug(slug)
  if (!item) return { title: 'Оборудование не найдено' }
  const meta = buildMetadata('new', `/equipment/${item.slug}`)
  return {
    ...meta,
    title: item.title,
    description:
      item.description?.replace(/\s+/g, ' ').slice(0, 158) ??
      `${item.title}: характеристики, наличие и цена. Склад в Краснодаре.`,
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      title: item.title,
      description: item.description?.slice(0, 158) ?? undefined,
      url: absoluteUrl(`/equipment/${item.slug}`),
      images: item.images_parsed[0]
        ? [{ url: item.images_parsed[0], width: 1200, height: 800, alt: item.title }]
        : undefined,
    },
  }
}

export default async function EquipmentPage({ params }: Params) {
  const { slug } = await params
  const item = getEquipmentBySlug(slug)
  if (!item) notFound()

  const settings = getSettings()
  const related = getRelatedEquipment(item, 3)
  const paragraphs = (item.description ?? '').split('\n\n').filter(Boolean)
  const isRequest = item.price_on_request === 1 || item.price == null
  const isUsed = item.condition === 'used'

  return (
    <>
      <ProductJsonLd item={item} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: isUsed ? 'Б/У с проверкой' : 'Новое оборудование', path: isUsed ? '/used' : '/new' },
          { name: item.model || item.title, path: `/equipment/${item.slug}` },
        ]}
      />

      <section className="detail" style={{ paddingTop: 'clamp(20px, 3vw, 30px)' }}>
        <div className="container">
          <Breadcrumbs
            items={[
              { href: '/', label: 'Главная' },
              { href: isUsed ? '/used' : '/new', label: isUsed ? 'Б/У' : 'Новое' },
              { href: item.category ? `${isUsed ? '/used' : '/new'}?category=${item.category.slug}` : undefined, label: item.category?.short_title ?? 'Оборудование' },
              { label: item.model ?? item.title },
            ]}
          />

          <div className="detail__top" style={{ marginTop: 'clamp(20px, 3vw, 32px)' }}>
            <Gallery images={item.images_parsed} alt={item.title} />

            <div>
              <div className="detail__meta">
                {item.manufacturer && <span className="tag tag--plain">{item.manufacturer.name}</span>}
                <ConditionTag condition={item.condition} />
                {item.year && <span className="tag tag--plain">{item.year} г.</span>}
                {item.checked === 1 && <span className="tag tag--checked">Проверено механиком</span>}
              </div>

              <h1>{item.title}</h1>
              {paragraphs[0] && <p className="detail__lead">{paragraphs[0]}</p>}

              <aside className="buy-panel">
                <div className="buy-panel__price">
                  {isRequest ? (
                    <>
                      <span className="buy-panel__request">Цена по запросу</span>
                      <span>ответим в течение 2 часов</span>
                    </>
                  ) : (
                    <>
                      <b>{formatPrice(item.price)}</b>
                      <span>с НДС · самовывоз или доставка</span>
                    </>
                  )}
                </div>

                <dl className="buy-panel__rows">
                  <div className="buy-panel__row">
                    <dt>Наличие</dt>
                    <dd>
                      <StatusTag status={item.status} />
                    </dd>
                  </div>
                  <div className="buy-panel__row">
                    <dt>Состояние</dt>
                    <dd>{CONDITION_LABEL[item.condition]}{isUsed ? ', проверено' : ''}</dd>
                  </div>
                  {item.year && (
                    <div className="buy-panel__row">
                      <dt>Год выпуска</dt>
                      <dd>{item.year}</dd>
                    </div>
                  )}
                  <div className="buy-panel__row">
                    <dt>Производитель</dt>
                    <dd>{item.manufacturer?.name ?? '—'}</dd>
                  </div>
                  <div className="buy-panel__row">
                    <dt>Склад</dt>
                    <dd>Краснодар, Полевая 43</dd>
                  </div>
                </dl>

                <div className="buy-panel__actions">
                  <a href="#zayavka" className="btn btn--primary btn--block">
                    {isUsed ? 'Записаться на осмотр' : 'Запросить КП'}
                    <span className="btn__arrow" aria-hidden="true" />
                  </a>
                  <a href={`tel:${safePhone(settings.phone_href)}`} className="btn btn--ghost btn--block">
                    <PhoneIcon size={14} />
                    {settings.phone_display}
                  </a>
                </div>

                <CompareToggle slug={item.slug} title={item.model || item.title} />

                <p className="buy-panel__note">
                  {isUsed
                    ? 'Станок запущен и проверен на складе. Приезжайте с профилем — обработаем его при вас до сделки.'
                    : 'Подключение, обучение оператора и гарантия 12 месяцев входят в стоимость. Доставку считаем отдельно по адресу.'}
                </p>

                {item.passport_url && (
                  <div className="buy-panel__docs">
                    <a className="doc-link" href={item.passport_url} target="_blank" rel="noopener noreferrer">
                      <DocIcon size={15} />
                      Паспорт и протокол проверки
                      <span>PDF</span>
                    </a>
                  </div>
                )}
              </aside>
            </div>
          </div>

          {item.specs_parsed.length > 0 && (
            <div className="detail__section">
              <h2>Характеристики</h2>
              <dl className="spec-table">
                {item.specs_parsed.map((spec) => (
                  <div className="spec-row" key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
              {(item.power || item.weight || item.dimensions) && (
                <div className="spec-triplet">
                  {item.power && (
                    <div>
                      <span className="label">Питание</span>
                      <b>{item.power}</b>
                    </div>
                  )}
                  {item.weight && (
                    <div>
                      <span className="label">Масса</span>
                      <b>{item.weight}</b>
                    </div>
                  )}
                  {item.dimensions && (
                    <div>
                      <span className="label">Габариты</span>
                      <b>{item.dimensions}</b>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {paragraphs.length > 1 && (
            <div className="detail__section">
              <h2>Что это за станок</h2>
              <div className="prose">
                {paragraphs.slice(1).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {isUsed && item.condition_note && (
            <div className="detail__section">
              <h2>Состояние и что сделали</h2>
              <div className="condition-box">
                <h3>Заключение механика</h3>
                <p>{item.condition_note}</p>
                <div className="condition-box__meta">
                  <span>Проверено: {formatDate(item.updated_at)}</span>
                  <span>Гарантия на механику: 3 месяца</span>
                  <span>Отметка: «проверено, запущено»</span>
                </div>
              </div>
            </div>
          )}

          {item.complete_set && (
            <div className="detail__section">
              <h2>Комплектация</h2>
              <p className="prose" style={{ fontSize: 15 }}>
                {item.complete_set}
              </p>
            </div>
          )}

          <div className="detail__section">
            <h2>Поставка и запуск</h2>
            <div className="supply-grid">
              <div className="supply-cell">
                <TruckIcon size={20} />
                <h3>Доставка</h3>
                <p>
                  Свой транспорт и бригада. Негабарит до 13 м, страхование груза. Стоимость — по адресу и габаритам,
                  считаем до подписания.
                </p>
              </div>
              <div className="supply-cell">
                <WrenchIcon size={20} />
                <h3>Пусконаладка</h3>
                <p>
                  Выставляем по уровню, подключаем пневматику и электрику, проверяем геометрию на вашем профиле. Обучение
                  оператора — 4 часа.
                </p>
              </div>
              <div className="supply-cell">
                <ShieldIcon size={20} />
                <h3>Гарантия</h3>
                <p>
                  {isUsed
                    ? '3 месяца на механику. Запчасти — по гарантии производителя, типовые позиции со склада в Краснодаре.'
                    : '12 месяцев заводской гарантии. Сервис — свой, не через дилера: приезжаем мы, а не «оставьте заявку».'}
                </p>
              </div>
            </div>
          </div>

          <div className="detail__section">
            <div className="contact-strip">
              <div>
                <span className="label label--accent">Осмотр на складе</span>
                <h2 style={{ marginTop: 10 }}>Приезжайте с профилем — покажем в работе</h2>
                <p className="muted" style={{ marginTop: 12, maxWidth: '52ch', fontSize: 14 }}>
                  {settings.address}. Будни 8:30–18:00, суббота до 14:00. Если едете издалека — позвоните: подготовим
                  станок и запустим к вашему приезду.
                </p>
              </div>
              <div className="contact-strip__actions">
                <a href={`tel:${safePhone(settings.phone_href)}`} className="btn btn--ink">
                  <PhoneIcon size={14} />
                  {settings.phone_display}
                </a>
                <a
                  href={`https://yandex.ru/maps/?text=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="textlink"
                >
                  Схема проезда
                  <ArrowIcon size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="detail__section" id="zayavka">
            <div className="split split--form">
              <div>
                <span className="label label--accent">Заявка по этой единице</span>
                <h2 style={{ marginTop: 12 }}>Запросить КП на {item.model ?? 'станок'}</h2>
                <p className="muted" style={{ marginTop: 14, fontSize: 14, maxWidth: '44ch' }}>
                  Пришлём цену, срок поставки, условия доставки и, если нужно, видео работы станка. Заявка автоматически
                  привяжется к этой карточке — модель называть не нужно.
                </p>
                <ul className="checklist" style={{ marginTop: 22, maxWidth: 420 }}>
                  <li>
                    <CheckIcon size={13} />
                    <span>Ответ в течение 2 часов в рабочее время</span>
                  </li>
                  <li>
                    <CheckIcon size={13} />
                    <span>Без навязчивых звонков: один ответ — дальше по вашему запросу</span>
                  </li>
                  <li>
                    <CheckIcon size={13} />
                    <span>
                      {isUsed ? 'Можно приехать на осмотр до внесения предоплаты' : 'Срок фиксируем в договоре, а не «по факту»'}
                    </span>
                  </li>
                </ul>
              </div>
              <LeadForm
                equipmentId={item.id}
                equipmentTitle={item.model ?? item.title}
                source={`/equipment/${item.slug}`}
                title="Запрос по станку"
                subtitle={item.model ?? 'Оборудование'}
                cta="Запросить КП"
              />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--paper2" style={{ background: 'var(--paper-2)' }}>
          <div className="container">
            <div className="sec-head">
              <span className="sec-head__index">[ 09 ]</span>
              <h2 className="sec-head__title">Похожие машины на складе</h2>
              <div className="sec-head__meta">
                <Link href={isUsed ? '/used' : '/new'} className="textlink">
                  Весь каталог
                  <ArrowIcon size={12} />
                </Link>
              </div>
            </div>
            <div className="eq-grid">
              {related.map((rel, i) => (
                <Reveal key={rel.id} delay={i * 70}>
                  <EquipmentCard item={rel} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

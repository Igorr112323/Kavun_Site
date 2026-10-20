import Link from 'next/link'
import { CatalogueFilters } from './catalogue-filters'
import { EquipmentCard } from './equipment-card'
import { LeadForm } from './lead-form'
import { PageHead } from './page-head'
import { Reveal } from './reveal'
import { ConditionTag } from './status-tag'
import { ArrowIcon } from './icons'
import {
  countEquipment,
  getCategories,
  getCategoryCounts,
  getEquipmentList,
  getManufacturers,
  getPage,
} from '@/lib/data'
import { equipmentCountLabel } from '@/lib/utils'

type Search = { category?: string; manufacturer?: string; sort?: string }

export function CatalogueView({
  slug,
  condition,
  path,
  title,
  search,
}: {
  slug: 'new' | 'used'
  condition: 'new' | 'used'
  path: string
  title: string
  search?: Search
}) {
  const page = getPage(slug)
  const b = page.blocks
  const categories = getCategories()
  const manufacturers = getManufacturers()
  const counts = getCategoryCounts(condition)
  const items = getEquipmentList({
    condition,
    category: search?.category,
    manufacturer: search?.manufacturer,
    sort: search?.sort,
  })
  const total = countEquipment(condition)
  const activeCategory = search?.category ? categories.find((c) => c.slug === search.category) : null
  const sortLabel =
    search?.sort === 'price_asc'
      ? 'цена по возрастанию'
      : search?.sort === 'price_desc'
        ? 'цена по убыванию'
        : search?.sort === 'year'
          ? 'сначала свежие'
          : 'по складу'

  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { href: '/new', label: 'Оборудование' },
          { label: title },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'На складе и в поставке', value: equipmentCountLabel(total) },
          { label: 'Гарантия', value: condition === 'new' ? '12 месяцев' : '3 месяца' },
          { label: 'Наличие', value: 'Краснодар, Полевая 43' },
        ]}
      />

      <CatalogueFilters
        categories={categories}
        manufacturers={manufacturers}
        total={items.length}
        allTotal={total}
        counts={counts}
      />

      <section className="catalogue">
        <div className="container">
          <h2 className="sr-only">Каталог: {title}</h2>
          <div className="catalogue__bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <ConditionTag condition={condition} />
              <span className="label">
                {activeCategory ? activeCategory.title : 'Все категории'} · {equipmentCountLabel(items.length)}
              </span>
            </div>
            <span className="label">Сортировка: {sortLabel}</span>
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <span className="label label--accent">Ничего не нашлось</span>
              <h2 style={{ fontSize: '1.8rem' }}>Под эти фильтры машин нет</h2>
              <p className="muted" style={{ fontSize: 14 }}>
                Склад обновляется вручную, иногда с задержкой. Сбросьте фильтры или напишите — подберём под задачу, даже
                если нужной модели сейчас нет в наличии.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href={path} className="btn btn--ink btn--sm">
                  Сбросить фильтры
                  <ArrowIcon size={12} />
                </Link>
                <Link href="/contacts#zayavka" className="btn btn--ghost btn--sm">
                  Написать нам
                </Link>
              </div>
            </div>
          ) : (
            <div className="eq-grid">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 70}>
                  <EquipmentCard item={item} index={i} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="catalogue__note">
            <div>
              <b>{condition === 'used' ? 'Что входит в цену' : 'Цена и сроки'}</b>
              {condition === 'used' ? 'Проверка, гарантия, погрузка' : 'НДС, пусконаладка, обучение'}
            </div>
            <p>{b.note}</p>
          </div>

          <div className="catalogue__form">
            <div>
              <span className="label label--accent">Не нашли модель?</span>
              <h2 style={{ marginTop: 12, maxWidth: '16ch' }}>Подберём под вашу номенклатуру</h2>
              <p className="muted" style={{ fontSize: 14, marginTop: 14, maxWidth: '44ch' }}>
                Скажите, какие системы профиля вы собираете и сколько рамок в смену. Посчитаем машину, срок и окупаемость
                — без «приезжайте, обсудим».
              </p>
            </div>
            <LeadForm
              source={path}
              title={condition === 'used' ? 'Записаться на осмотр станка' : 'Запросить КП с ценой и сроком'}
              subtitle="Ответим в течение 2 часов"
              cta="Отправить запрос"
            />
          </div>
        </div>
      </section>
    </>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BrandStrip } from '@/components/brand-strip'
import { Counter } from '@/components/counter'
import { EquipmentCard } from '@/components/equipment-card'
import { LeadForm } from '@/components/lead-form'
import { MapScheme } from '@/components/map-scheme'
import { Reveal } from '@/components/reveal'
import { SectionHead } from '@/components/section-head'
import { OrganizationJsonLd } from '@/components/jsonld'
import { ArrowIcon, ArrowUpRight, CheckIcon, RouteIcon, TruckIcon } from '@/components/icons'
import {
  countEquipment,
  countInStock,
  getCatalogs,
  getEquipmentList,
  getPage,
  getPosts,
  getSettings,
  getStats,
} from '@/lib/data'
import { formatDate, formatNumber } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('home', '/')
}

export default function HomePage() {
  const settings = getSettings()
  const page = getPage('home')
  const b = page.blocks
  const units = countEquipment()
  const inStock = countInStock()
  const incoming = units - inStock
  const stats = getStats().map((s, i) => (i === 3 ? { ...s, value: units } : s))
  const featured = getEquipmentList({ featured: true, limit: 3 })
  const posts = getPosts(3)
  const catalogs = getCatalogs().slice(0, 3)
  const today = formatDate(new Date())
  const checkMonth = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <>
      <OrganizationJsonLd />

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__top">
            <span className="dot">{b.hero_kicker}</span>
            <span className="hero__coords">{settings.work_hours}</span>
          </div>

          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="hero__title">
                <span className="hero__line">{b.hero_title}</span>
                <span className="hero__line hero__line--accent">{b.hero_accent}</span>
              </h1>
              <p className="hero__lead">{b.hero_lead}</p>
              <div className="hero__actions">
                <a href="#stock" className="btn btn--primary">
                  Смотреть наличие
                  <span className="btn__arrow" aria-hidden="true" />
                </a>
                <Link href="/service" className="btn btn--ghost">
                  Вызвать механика
                </Link>
              </div>
              <p className="hero__caption">{b.hero_note}</p>
            </div>

            <div className="hero__media">
              <Image
                src="/images/hero-workshop.jpg"
                alt="Обрабатывающий центр для алюминиевого профиля в цеху"
                fill
                priority
                sizes="(max-width: 1080px) 100vw, 46vw"
                style={{ objectFit: 'cover' }}
              />
              <span className="corner corner--tl" aria-hidden="true" />
              <span className="corner corner--br" aria-hidden="true" />
              <div className="plate">
                <div className="plate__head">
                  <span>Склад · Краснодар</span>
                  <span>{today}</span>
                </div>
                <div className="plate__value">
                  {formatNumber(inStock)}
                  <small>ед. на складе</small>
                </div>
                <div className="plate__foot">
                  {incoming > 0 ? `ещё ${incoming} в пути и под заказ · покажем в работе до сделки` : 'покажем в работе до сделки'}
                </div>
              </div>
            </div>
          </div>

          <div className="hero__stats">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <div className="stat__value">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandStrip label="С какими брендами работаем" />

      {/* ============ DIRECTIONS ============ */}
      <section className="section" id="directions">
        <div className="container">
          <Reveal>
            <SectionHead
              index="01"
              title={b.intro_title}
              meta={<Link href="/new" className="textlink">Каталог нового оборудования</Link>}
            />
          </Reveal>
          <Reveal delay={60}>
            <p className="lead section-intro">{b.intro_text}</p>
          </Reveal>

          <div className="dirs">
            <Reveal>
              <Link href="/new" className="dir-main">
                <Image
                  src="/images/prod-machining-centre.jpg"
                  alt="Обрабатывающий центр с ЧПУ на складе"
                  fill
                  sizes="(max-width: 1080px) 100vw, 52vw"
                  className="dir-main__img"
                />
                <span className="corner corner--tl" aria-hidden="true" />
                <div className="dir-main__content">
                  <span className="dir-main__kicker">01 — Новое оборудование</span>
                  <h3>Встаёт в цех и начинает резать, а не ждёт наладки месяц</h3>
                  <p>
                    elumatec, Emmegi, Stürtz, Haffner. Подбираем под вашу номенклатуру, считаем окупаемость по программе
                    выпуска, пусконаладку делают наши механики.
                  </p>
                  <span className="textlink" style={{ color: 'var(--paper)', borderColor: 'rgba(236,233,225,.35)' }}>
                    Смотреть каталог
                    <span className="btn__arrow" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <div className="dir-list">
              {[
                {
                  href: '/used',
                  num: '02',
                  title: 'Б/У с проверкой',
                  text: 'Запускаем под нагрузкой, фиксируем биение шпинделя и геометрию. Что меняли — написано в карточке. Гарантия 3 месяца.',
                },
                {
                  href: '/service',
                  num: '03',
                  title: 'Ремонт и сервис',
                  text: 'Выезд по Краснодару за 24 часа, по ЮФО — до 48. Диагностика 2 500 ₽, при ремонте входит в стоимость.',
                },
                {
                  href: '/logistics',
                  num: '04',
                  title: 'Перевозка и монтаж',
                  text: 'Негабарит до 13 м, свой транспорт и механики. Демонтаж, погрузка, страхование, запуск на новом месте.',
                },
              ].map((item, i) => (
                <Reveal key={item.href} delay={i * 70}>
                  <Link href={item.href} className="dir-item">
                    <span className="dir-item__num">{item.num}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                    <span className="dir-item__arrow" aria-hidden="true">
                      <ArrowUpRight size={10} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STOCK ============ */}
      <section className="section section--paper2" id="stock" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <Reveal>
            <SectionHead
              index="02"
              title={b.stock_title}
              meta={<Link href="/used" className="textlink">Все единицы на складе</Link>}
            />
          </Reveal>
          <Reveal delay={60}>
            <p className="lead section-intro">{b.stock_text}</p>
          </Reveal>
          <div className="eq-grid">
            {featured.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <EquipmentCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ USED / CHECK ============ */}
      <section className="section">
        <div className="container">
          <div className="split split--wide-left">
            <Reveal>
              <div className="split__media">
                <Image
                  src="/images/used-warehouse.jpg"
                  alt="Б/у станки в цеху на складе в Краснодаре"
                  fill
                  sizes="(max-width: 1080px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp">
                  Проверено
                  <b>ЗАПУЩЕНО</b>
                  {checkMonth} · механик
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__content">
                <span className="label label--accent">03 — Б/у без сюрпризов</span>
                <h2>Б/у — это не лотерея, а девять проверок</h2>
                <p className="muted" style={{ fontSize: 15 }}>
                  «В рабочем состоянии» ничего не значит: станок может резать и не держать допуск. Поэтому мы гоняем
                  его под нагрузкой, меряем и записываем результат — с датой и подписью механика.
                </p>
                <ul className="checklist">
                  {[
                    'Геометрия после 40–60 минут прогрева, а не «на холодную»',
                    'Биение шпинделя — для HSK-63F норма до 0,01 мм',
                    'Люфт осей, состояние ШВП и направляющих',
                    'Тестовая деталь на вашем профиле до сделки',
                  ].map((text, i) => (
                    <li key={text}>
                      <span className="checklist__num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/used" className="textlink">
                  Смотреть б/у с проверкой
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ SERVICE ============ */}
      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <SectionHead
              index="04"
              title={b.service_title}
              meta={<Link href="/service" className="textlink" style={{ color: 'var(--paper)' }}>Условия сервиса</Link>}
            />
          </Reveal>
          <div className="split" style={{ alignItems: 'stretch' }}>
            <Reveal>
              <div className="split__media" style={{ aspectRatio: '4 / 5' }}>
                <Image
                  src="/images/service-hands.jpg"
                  alt="Механик измеряет алюминиевый профиль штангенциркулем"
                  fill
                  sizes="(max-width: 1080px) 100vw, 46vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp" style={{ right: 'auto', left: -14, top: 24 }}>
                  24 часа
                  <b>ВЫЕЗД ПО КРАЮ</b>
                  диагностика в стоимость ремонта
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__content">
                <p className="lead">{b.service_text}</p>
                <div className="svc-rows">
                  {[
                    { t: 'Диагностика', d: 'Ищем причину, а не симптом. Проверяем механику, пневматику и журнал ЧПУ.', term: '2 500 ₽' },
                    { t: 'Ремонт механики', d: 'ШВП, направляющие, зажимы, редукторы. Типовые запчасти — со склада.', term: 'от 1 дня' },
                    { t: 'ЧПУ и электрика', d: 'Параметры, частотники, датчики, восстановление программ после сбоя.', term: 'от 2 дней' },
                    { t: 'Обслуживание', d: 'Регламент раз в квартал: смазка, геометрия, чистка, отчёт.', term: 'договор' },
                  ].map((row, i) => (
                    <div className="svc-row" key={row.t}>
                      <span className="svc-row__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="svc-row__title">{row.t}</span>
                      <span className="svc-row__desc">{row.d}</span>
                      <span className="svc-row__term">{row.term}</span>
                    </div>
                  ))}
                </div>
                <Link href="/service" className="textlink" style={{ color: 'var(--paper)', borderColor: 'var(--line-dark-strong)', alignSelf: 'start' }}>
                  Вызвать механика
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="figures" style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
            {[
              { v: 740, s: '+', l: 'станков прошло через сервис с 2014 года', e: '' },
              { v: 48, s: ' ч', l: 'максимальный срок выезда по ЮФО', e: '' },
              { v: 9, s: '', l: 'пунктов проверки перед продажей б/у', e: '' },
              { v: 3, s: ' мес', l: 'гарантия на механику б/у станков', e: '' },
            ].map((f) => (
              <div className="figure" key={f.l}>
                <div className="figure__value">
                  <Counter value={f.v} suffix={f.s} />
                </div>
                <div className="figure__label">{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LOGISTICS ============ */}
      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal>
              <div className="split__content">
                <span className="label label--accent">05 — Перевозка и монтаж</span>
                <h2>Перевезём так, чтобы станок не пришлось рихтовать</h2>
                <p className="muted" style={{ fontSize: 15 }}>
                  Считаем маршрут до выезда: ворота, повороты, высоту проёма, нагрузку на пол. Разбираем сами, маркируем
                  кабели, грузим за штатные точки. На месте выставляем по уровню и запускаем.
                </p>
                <div className="about-facts" style={{ gridTemplateColumns: '1fr 1fr', background: 'var(--line)' }}>
                  <div className="about-fact">
                    <b>13 м</b>
                    <span>максимальный негабарит, который перевозили: Satellite XTE 10,5</span>
                  </div>
                  <div className="about-fact">
                    <b>9 дней</b>
                    <span>от демонтажа в Подмосковье до первого реза в Краснодаре</span>
                  </div>
                  <div className="about-fact">
                    <b>100%</b>
                    <span>грузов страхуем до передачи на месте</span>
                  </div>
                  <div className="about-fact">
                    <b>0</b>
                    <span>станков, которые после перевозки пришлось ремонтировать по нашей вине</span>
                  </div>
                </div>
                <Link href="/logistics" className="textlink">
                  Расчёт перевозки
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__media" style={{ aspectRatio: '4 / 4.6' }}>
                <Image
                  src="/images/logistics.jpg"
                  alt="Погрузка промышленного станка краном на низкорамный трал"
                  fill
                  sizes="(max-width: 1080px) 100vw, 48vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp stamp--onlight" style={{ right: 18, top: 18 }}>
                  Краснодар
                  <b>— РОСТОВ — ВОРОНЕЖ</b>
                  регулярные рейсы
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ NEWS ============ */}
      <section className="section section--tight" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <Reveal>
            <SectionHead
              index="06"
              title="Что происходит на складе"
              meta={<Link href="/news" className="textlink">Все новости</Link>}
            />
          </Reveal>
          <div className="news-list">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 60} as="article">
                <article className="news-row">
                  <span className="news-row__date">{formatDate(post.published_at)}</span>
                  <h3 className="news-row__title">
                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <span className="news-row__excerpt">{post.excerpt}</span>
                  <span className="news-row__arrow" aria-hidden="true">
                    <ArrowIcon size={13} />
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATALOGS ============ */}
      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <Reveal>
            <SectionHead
              index="07"
              title="Каталоги, которые не стыдно открыть при клиенте"
              meta={<Link href="/catalogs" className="textlink">Все PDF</Link>}
            />
          </Reveal>
          <div className="cat-grid">
            {catalogs.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 70}>
                <article className="cat-card">
                  <div className="cat-card__cover">
                    <Image
                      src={cat.cover || '/images/og-catalog-elumatec.jpg'}
                      alt={`Обложка каталога ${cat.title}`}
                      fill
                      sizes="(max-width: 760px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="cat-card__body">
                    <span className="cat-card__meta">
                      <span>{cat.manufacturer?.name}</span>
                      <span>{cat.pages_label}</span>
                      <span>{cat.file_size}</span>
                    </span>
                    <h3>{cat.title}</h3>
                    <p className="cat-card__desc">{cat.description}</p>
                    <a className="cat-card__dl" href={cat.pdf_url ?? '#'} download>
                      Скачать PDF
                      <ArrowIcon size={12} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA + CONTACTS ============ */}
      <section className="section section--dark cta" id="contacts">
        <div className="container cta__inner">
          <Reveal>
            <div className="cta__copy">
              <span className="label label--accent">08 — Заявка</span>
              <h2>{b.cta_title}</h2>
              <p className="lead">{b.cta_text}</p>
              <ul className="cta__points">
                <li>Ответ в течение 2 часов в рабочее время</li>
                <li>Смету присылаем до ремонта, без «вскрытия»</li>
                <li>Выезд по Краснодару — 24 часа, по ЮФО — до 48</li>
              </ul>

              <div className="contact-grid" style={{ gridTemplateColumns: '1fr', gap: 24, marginTop: 8 }}>
                <div className="contact-rows">
                  <div className="contact-row">
                    <span className="contact-row__label">Адрес</span>
                    <span className="contact-row__value">{settings.address}</span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-row__label">Телефон</span>
                    <span className="contact-row__value contact-row__value--big">
                      <a href={`tel:${settings.phone_href}`}>{settings.phone_display}</a>
                    </span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-row__label">Почта</span>
                    <span className="contact-row__value">
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-row__label">Часы</span>
                    <span className="contact-row__value">{settings.work_hours}</span>
                  </div>
                </div>
                <MapScheme address={settings.address} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <LeadForm source="/" title="Запросить КП или выезд" subtitle="Обычно отвечаем за 2 часа" cta="Отправить запрос" />
          </Reveal>
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 24 }}>
        <div className="label" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span>
            <RouteIcon size={12} className="inline-icon" /> Краснодар · Ростов · Ставрополь · Адыгея · Крым
          </span>
          <span>
            <TruckIcon size={12} className="inline-icon" /> Негабарит до 13 м · страхование груза
          </span>
          <span>
            <CheckIcon size={12} className="inline-icon" /> Работаем с 2014 года
          </span>
        </div>
      </div>
    </>
  )
}

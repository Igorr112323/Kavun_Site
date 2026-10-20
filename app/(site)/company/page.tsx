import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { Reveal } from '@/components/reveal'
import { SectionHead } from '@/components/section-head'
import { LeadForm } from '@/components/lead-form'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { ArrowIcon, CheckIcon } from '@/components/icons'
import { getPage, getManufacturers } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('company', '/company')
}

export default function CompanyPage() {
  const page = getPage('company')
  const b = page.blocks
  const manufacturers = getManufacturers()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'О компании', path: '/company' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'О компании' },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'С', value: '2014 года' },
          { label: 'Склад', value: '900 м²' },
          { label: 'Команда', value: '4 механика' },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left" style={{ alignItems: 'start' }}>
            <Reveal>
              <div className="split__content">
                <span className="label label--accent">Кто мы</span>
                <h2>Начали с ремонта пил, а не с «комплексных решений»</h2>
                <div className="prose" style={{ fontSize: 15.5 }}>
                  {b.intro.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <div className="checklist" style={{ marginTop: 8 }}>
                  {[
                    ['Не продаём станок, который не видели', 'Новое — принимаем на складе и проверяем комплектацию. Б/у — запускаем до продажи.'],
                    ['Не обещаем срок, который не подтвердил производитель', 'Если срок плавает — говорим об этом до договора, а не после предоплаты.'],
                    ['Не берём б/у без истории', 'Нет сервисной книжки и внятной причины продажи — не выставляем.'],
                  ].map(([t, d]) => (
                    <div key={t} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                      <CheckIcon size={14} className="inline-icon" />
                      <div>
                        <b style={{ fontSize: 14 }}>{t}</b>
                        <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__media" style={{ aspectRatio: '4 / 4.6' }}>
                <Image
                  src="/images/workshop-wide.jpg"
                  alt="Мастерская Vip-service в Краснодаре"
                  fill
                  sizes="(max-width: 1080px) 100vw, 48vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp stamp--onlight" style={{ left: 18, top: 18, right: 'auto' }}>
                  Краснодар
                  <b>ПОЛЕВАЯ, 43</b>
                  склад · сервис · мастерская
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--paper2" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <Reveal>
            <SectionHead index="02" title="Склад, который можно потрогать" meta={<span>{b.warehouse_note}</span>} />
          </Reveal>
          <div className="about-facts">
            {[
              ['900 м²', 'площадь склада с кран-балкой и ровным полом под запуск станков'],
              ['12', 'единиц оборудования на складе в Краснодаре на этой неделе'],
              ['4', 'механика и инженер по ЧПУ в штате, не подряд'],
              ['4', 'бренда, по которым держим расходники и оснастку'],
            ].map(([v, l]) => (
              <div className="about-fact" key={l}>
                <b>{v}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead index="03" title="Команда" meta={<span>{b.team_note}</span>} />
          </Reveal>
          <div className="team-grid">
            {[
              ['Сервис и ремонт', 'Два механика по механике и пневматике. Выезжают с инструментом и типовыми запчастями, а не «на диагностику».'],
              ['ЧПУ и электрика', 'Инженер, который читает журналы ошибок elumatec и Emmegi и восстанавливает параметры после сбоев.'],
              ['Склад и логистика', 'Комплектовщик и водитель с опытом негабарита. Отвечают за то, чтобы станок приехал собранным.'],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={i * 70}>
                <div className="team-cell">
                  <span className="label label--accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="split">
            <Reveal>
              <div className="split__content">
                <span className="label label--accent">Партнёры</span>
                <h2>Четыре бренда, три из них — одна группа</h2>
                <p className="lead">
                  elumatec, Emmegi и Stürtz входят в Voilàp Group, Haffner работает отдельно. Это влияет на сроки
                  запчастей и сервисные процедуры — и мы это учитываем, когда обещаем дату.
                </p>
                <div className="brand-list">
                  {manufacturers.map((m) => (
                    <div key={m.id} className="brand-row">
                      <div>
                        <span className="brand-row__name">{m.name}</span>
                        <span className="label">{m.country}</span>
                      </div>
                      <p>{m.summary}</p>
                      <a href={m.site_url ?? '#'} target="_blank" rel="noopener noreferrer" className="brand-row__link">
                        Сайт бренда
                        <ArrowIcon size={11} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__media" style={{ aspectRatio: '4 / 4.8' }}>
                <Image
                  src="/images/profiles.jpg"
                  alt="Алюминиевые профили крупным планом"
                  fill
                  sizes="(max-width: 1080px) 100vw, 46vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead index="04" title="Хронология без «динамично развивающейся компании»" meta={<span>Коротко, по годам</span>} />
          </Reveal>
          <div className="timeline">
            {[
              ['2014', 'Сервис пил', 'Начали с ремонта двухголовых пил и копировально-фрезерных станков в Краснодаре.'],
              ['2016', 'Первый склад', 'Сняли помещение под хранение б/у техники и запуск станков перед продажей.'],
              ['2018', 'Поставки elumatec и Emmegi', 'Подписали прямые условия, начали возить новые центры и пилы.'],
              ['2021', 'Свой транспорт', 'Купили трал и стали перевозить негабарит сами, не через подрядчиков.'],
              ['2023', 'Stürtz и Haffner', 'Добавили ПВХ-направление: сварка, зачистка, обрабатывающие центры.'],
              ['2026', 'Склад 900 м²', 'Переехали на Полевую, 43: кран-балка, место под запуск и осмотр.'],
            ].map(([year, title, text]) => (
              <div className="timeline__row" key={year}>
                <span className="timeline__year">{year}</span>
                <span className="timeline__title">{title}</span>
                <span className="timeline__text">{text}</span>
              </div>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: 14 }}>
            Хронология — фактическая. Цифры по количеству ремонтов считаем по внутренней базе, а не «на глаз».
          </p>
        </div>
      </section>

      <section className="section section--paper2" id="zayavka" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="split split--form">
            <div>
              <span className="label label--accent">Приезжайте</span>
              <h2 style={{ marginTop: 12 }}>Станок лучше один раз увидеть в работе</h2>
              <p className="muted" style={{ marginTop: 14, fontSize: 15, maxWidth: '46ch' }}>
                Склад открыт в будни с 8:30 до 18:00. Позвоните заранее — подготовим машину, подключим и запустим на
                вашем профиле.
              </p>
              <Link href="/contacts" className="textlink" style={{ marginTop: 22 }}>
                Контакты и схема проезда
                <ArrowIcon size={12} />
              </Link>
            </div>
            <LeadForm source="/company" title="Записаться на осмотр" subtitle="Согласуем время" cta="Записаться" />
          </div>
        </div>
      </section>
    </>
  )
}

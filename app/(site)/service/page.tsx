import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { LeadForm } from '@/components/lead-form'
import { Reveal } from '@/components/reveal'
import { SectionHead } from '@/components/section-head'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { ArrowIcon, CheckIcon } from '@/components/icons'
import { getPage, getSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { safePhone } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('service', '/service')
}

const FAULTS = [
  ['После переезда ушла геометрия', 'Станина выставлена по старой плите, перекос по X', '1–2 дня', 'от 18 000 ₽'],
  ['Зажим не держит профиль', 'Износ манжет, конденсат в пневмолинии', 'в день выезда', 'от 6 500 ₽'],
  ['Станок не выходит в размер', 'Люфт ШВП, износ направляющих, сбитые параметры', '2–5 дней', 'от 34 000 ₽'],
  ['Ошибка привода или частотника', 'Перегруз, износ подшипников, перегрев шкафа', '1–3 дня', 'от 12 000 ₽'],
  ['Сварка даёт щель по углу', 'Износ нагревателя, непараллельность голов', '1–2 дня', 'от 9 500 ₽'],
  ['ЧПУ потерял параметры', 'Села батарея, сбой после отключения', '1 день', 'от 7 000 ₽'],
]

export default function ServicePage() {
  const page = getPage('service')
  const b = page.blocks
  const settings = getSettings()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Ремонт и сервис', path: '/service' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Ремонт и сервис' },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'Выезд по Краснодару', value: '24 часа' },
          { label: 'Диагностика', value: '2 500 ₽' },
          { label: 'Гарантия на работы', value: '6 месяцев' },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left" style={{ alignItems: 'start' }}>
            <Reveal>
              <div className="split__media" style={{ aspectRatio: '4 / 4.4' }}>
                <Image
                  src="/images/workshop-wide.jpg"
                  alt="Ремонт оборудования для окон в мастерской Vip-service"
                  fill
                  sizes="(max-width: 1080px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp stamp--onlight" style={{ right: 18, top: 18 }}>
                  Свой цех
                  <b>НЕ ПОДРЯД</b>
                  инструмент, стенды, запчасти
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__content">
                <span className="label label--accent">Как устроена работа</span>
                <h2>{b.terms_title}</h2>
                <p className="muted" style={{ fontSize: 15 }}>
                  {b.terms_text}
                </p>
                <ul className="checklist">
                  {[
                    'Диагностика 2 500 ₽ — при ремонте входит в стоимость',
                    'Смета до начала работ: без доплат «по факту вскрытия»',
                    'Типовые запчасти для elumatec, Emmegi, Stürtz и Haffner — на складе',
                    'Гарантия на работы 6 месяцев, на запчасти — по гарантии производителя',
                  ].map((text, i) => (
                    <li key={text}>
                      <span className="checklist__num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href={`tel:${safePhone(settings.phone_href)}`} className="btn btn--ink">
                    Вызвать механика
                    <span className="btn__arrow" aria-hidden="true" />
                  </a>
                  <a href="#zayavka" className="btn btn--ghost">
                    Описать проблему
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--paper2" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <Reveal>
            <SectionHead
              index="02"
              title={b.faults_title}
              meta={<span>Сроки — от момента подтверждения сметы</span>}
            />
          </Reveal>
          <Reveal delay={60}>
            <p className="lead section-intro">{b.faults_text}</p>
          </Reveal>

          <div className="fault-table" role="table" aria-label="Типовые неисправности и сроки">
            <div className="fault-table__head" role="row">
              <span role="columnheader">Симптом</span>
              <span role="columnheader">Причина</span>
              <span role="columnheader">Срок</span>
              <span role="columnheader">Стоимость работ</span>
            </div>
            {FAULTS.map(([sym, cause, term, price], i) => (
              <div className="fault-row" role="row" key={sym}>
                <span role="cell" className="fault-row__sym">
                  <em>{String(i + 1).padStart(2, '0')}</em>
                  {sym}
                </span>
                <span role="cell" className="fault-row__cause">
                  {cause}
                </span>
                <span role="cell" className="fault-row__term">
                  {term}
                </span>
                <span role="cell" className="fault-row__price">
                  {price}
                </span>
              </div>
            ))}
          </div>

          <p className="form-note" style={{ marginTop: 16 }}>
            Стоимость указана за работы без запчастей. Итог фиксируем в смете после диагностики — если ремонт
            нецелесообразен, честно скажем и предложим замену узла или станка.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              index="03"
              title="С какими машинами работаем"
              meta={<Link href="/new" className="textlink">Каталог оборудования</Link>}
            />
          </Reveal>
          <div className="machine-grid">
            {[
              {
                title: 'Обрабатывающие центры',
                text: 'elumatec SBZ 122/140, Emmegi Phantomatic, Comet, Satellite. Механика, ШВП, пневматика, параметры ЧПУ, калибровка геометрии.',
                brands: 'elumatec · Emmegi · Haffner',
              },
              {
                title: 'Пилы и раскрой',
                text: 'Двухголовые и одноголовые пилы, подача, углы 45/90, замена подшипников и настройка чистоты реза.',
                brands: 'elumatec · Emmegi',
              },
              {
                title: 'Сварка ПВХ',
                text: 'Двух- и четырёхголовые станки, нагреватели, параллельность голов, зачистка угла, оснастка под профиль.',
                brands: 'Stürtz · Haffner · elumatec',
              },
              {
                title: 'Вспомогательный участок',
                text: 'Копировально-фрезерные станки, прессы для армирования, шуруповёрты, штабелёры и столы сборки.',
                brands: 'все бренды',
              },
            ].map((m, i) => (
              <Reveal key={m.title} delay={i * 70}>
                <article className="machine-cell">
                  <span className="label label--accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <span className="machine-cell__brands">{m.brands}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="split split--wide-left">
            <Reveal>
              <div className="split__content">
                <span className="label label--accent">Обслуживание</span>
                <h2>Ремонт дешевле, когда станок не доводят до аварии</h2>
                <p className="lead">
                  Регламент раз в квартал: чистим и смазываем ШВП и направляющие, проверяем геометрию, пневматику и
                  журнал ошибок ЧПУ. По итогам — отчёт: что в норме, что изнашивается, что заказать заранее.
                </p>
                <div className="figures" style={{ marginTop: 18 }}>
                  {[
                    { v: '4', l: 'плановых ТО в год вместо внезапных простоев' },
                    { v: '24 ч', l: 'средний срок реакции по договору обслуживания' },
                    { v: '−38%', l: 'средняя стоимость ремонта при регулярном ТО (по нашим объектам)' },
                  ].map((f) => (
                    <div className="figure" key={f.l}>
                      <div className="figure__value">{f.v}</div>
                      <div className="figure__label">{f.l}</div>
                    </div>
                  ))}
                </div>
                <Link href="#zayavka" className="textlink" style={{ color: 'var(--paper)', borderColor: 'var(--line-dark-strong)', alignSelf: 'start' }}>
                  Запросить условия обслуживания
                  <span className="btn__arrow" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__media" style={{ aspectRatio: '4 / 4.2' }}>
                <Image
                  src="/images/saw-detail.jpg"
                  alt="Пильный диск станка крупным планом"
                  fill
                  sizes="(max-width: 1080px) 100vw, 46vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="zayavka">
        <div className="container">
          <div className="split split--form">
            <div>
              <span className="label label--accent">Заявка на выезд</span>
              <h2 style={{ marginTop: 12 }}>{b.cta_title}</h2>
              <p className="muted" style={{ marginTop: 16, fontSize: 15, maxWidth: '46ch' }}>
                {b.cta_text}
              </p>
              <ul className="checklist" style={{ marginTop: 24, maxWidth: 460 }}>
                <li>
                  <CheckIcon size={13} />
                  <span>Диагностика 2 500 ₽, при ремонте входит в стоимость</span>
                </li>
                <li>
                  <CheckIcon size={13} />
                  <span>Выезд по Краснодару — 24 часа, по краю и ЮФО — до 48</span>
                </li>
                <li>
                  <CheckIcon size={13} />
                  <span>Гарантия на работы 6 месяцев</span>
                </li>
              </ul>
              <a href={`tel:${safePhone(settings.phone_href)}`} className="textlink" style={{ marginTop: 22 }}>
                Или позвоните: {settings.phone_display}
                <ArrowIcon size={12} />
              </a>
            </div>
            <LeadForm source="/service" title="Вызвать механика" subtitle="Ответим в течение 2 часов" cta="Отправить заявку" />
          </div>
        </div>
      </section>
    </>
  )
}

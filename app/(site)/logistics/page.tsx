import type { Metadata } from 'next'
import Image from 'next/image'
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
  return buildMetadata('logistics', '/logistics')
}

const STEPS = [
  ['01', 'Замер и маршрут', 'До расчёта проверяем не только габариты станка, но и путь: ворота, повороты, проём, пол. Если нужно — просим разобрать секцию забора, а не «как-нибудь протолкнуть».'],
  ['02', 'Демонтаж', 'Отключаем, маркируем кабели и пневматику, снимаем узлы, которые нельзя везти в сборе. Всё, что снимаем, подписываем и упаковываем.'],
  ['03', 'Погрузка', 'Кран или манипулятор — по весу и точке подъёма. Стропим за штатные места или технологические отверстия, а не за кожух. Крепление к платформе — через подкладки и ремни.'],
  ['04', 'Перевозка', 'Низкорамный трал, согласование маршрута, сопровождение при негабарите. Груз страхуем на полную стоимость — это в договоре, а не «на словах».'],
  ['05', 'Монтаж и выставление', 'Ставим на подготовленную плиту, выставляем по уровню, собираем, подключаем. Проверяем геометрию по концевой мере.'],
  ['06', 'Запуск', 'Включаем, проверяем оси и параметры, делаем тестовую деталь на вашем профиле. Передаём с протоколом — и остаёмся на гарантии.'],
]

export default function LogisticsPage() {
  const page = getPage('logistics')
  const b = page.blocks
  const settings = getSettings()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Перевозка и монтаж', path: '/logistics' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Перевозка и монтаж' },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'Негабарит', value: 'до 13 м' },
          { label: 'Масса', value: 'до 12 т' },
          { label: 'Страхование', value: '100% стоимости' },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="split split--wide-left" style={{ alignItems: 'start' }}>
            <Reveal>
              <div className="split__content">
                <span className="label label--accent">Что делаем</span>
                <h2>{b.steps_title}</h2>
                <p className="muted" style={{ fontSize: 15 }}>{b.steps_text}</p>
                <div className="steps">
                  {STEPS.map(([num, title, text]) => (
                    <div className="step" key={num}>
                      <span className="step__num">{num}</span>
                      <div>
                        <h3>{title}</h3>
                        <p>{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="split__media" style={{ aspectRatio: '4 / 5' }}>
                <Image
                  src="/images/logistics.jpg"
                  alt="Погрузка станка краном на низкорамный трал"
                  fill
                  sizes="(max-width: 1080px) 100vw, 46vw"
                  style={{ objectFit: 'cover' }}
                />
                <span className="stamp">
                  Кейс
                  <b>SATELLITE XTE 10,5</b>
                  9 дней от демонтажа до реза
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <SectionHead
              index="02"
              title={b.geo_title}
              meta={<span>{b.geo_text}</span>}
            />
          </Reveal>
          <div className="geo-table">
            <div className="geo-row geo-row--head">
              <span>Направление</span>
              <span>Срок в пути</span>
              <span>От</span>
              <span>Что возили</span>
            </div>
            {[
              ['Краснодарский край', '1–2 дня', '18 000 ₽', 'Пилы, сварка, центры до 4 м'],
              ['Ростовская область', '2–3 дня', '32 000 ₽', 'Phantomatic T3A, DG 244'],
              ['Ставрополье и Адыгея', '2–3 дня', '28 000 ₽', 'Копировально-фрезерные, прессы'],
              ['Крым', '3–4 дня', '46 000 ₽', 'Сварочные линии ПВХ'],
              ['Москва и Подмосковье', '4–6 дней', '74 000 ₽', 'Satellite XTE 10,5 м, 9 т'],
              ['Урал и Поволжье', '5–8 дней', 'по расчёту', 'Центры с ЧПУ в разборе'],
            ].map(([dir, term, price, what]) => (
              <div className="geo-row" key={dir}>
                <span className="geo-row__dir">{dir}</span>
                <span>{term}</span>
                <span className="geo-row__price">{price}</span>
                <span className="geo-row__what">{what}</span>
              </div>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: 16, color: 'rgba(236,233,225,.45)' }}>
            «От» — стоимость перевозки без демонтажа и монтажа, для габарита до 6 м и массы до 3 т. Точная сумма — после
            замера и расчёта маршрута, до подписания договора.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-strip">
            <div>
              <span className="label label--accent">Кейс</span>
              <h2 style={{ marginTop: 10 }}>Satellite XTE 10,5 м: 9 дней и один разобранный забор</h2>
              <p className="muted" style={{ marginTop: 12, maxWidth: '56ch', fontSize: 14 }}>
                Портал 12,9 × 2,7 × 3,4 м из Подмосковья в Краснодар. Маршрут не проходил по радиусу у цеха — предложили
                разобрать секцию ограждения, а не резать портал. Демонтаж, погрузка краном 50 т, две ночные стоянки,
                монтаж, выставление и тестовая деталь. Станок работает, геометрия в допуске.
              </p>
              <div style={{ display: 'flex', gap: 28, marginTop: 18, flexWrap: 'wrap' }}>
                {[
                  ['12,9 м', 'длина груза'],
                  ['9 т', 'масса'],
                  ['9 дней', 'от демонтажа до реза'],
                  ['0', 'повреждений'],
                ].map(([v, l]) => (
                  <div key={l} style={{ display: 'grid', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1 }}>{v}</span>
                    <span className="label">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-strip__actions">
              <a href="#zayavka" className="btn btn--primary">
                Рассчитать перевозку
                <span className="btn__arrow" aria-hidden="true" />
              </a>
              <a href={`tel:${safePhone(settings.phone_href)}`} className="textlink">
                {settings.phone_display}
                <ArrowIcon size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--paper2" style={{ background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="split split--form">
            <div>
              <span className="label label--accent">Частые вопросы</span>
              <h2 style={{ marginTop: 12, maxWidth: '14ch' }}>До договора</h2>
              <div className="accordion" style={{ marginTop: 24 }}>
                {[
                  ['Кто отвечает, если станок повредят в пути?', 'Мы. Груз застрахован на полную стоимость, ответственность прописана в договоре перевозки. Если что-то случится — ремонт или компенсацию берём на себя, а не перекладываем на водителя.'],
                  ['Нужен ли кран на месте?', 'Зависит от машины. Для станков до 3 т часто хватает манипулятора, для порталов и линий — кран 25–50 т. Скажем заранее, чтобы вы заказали технику, а не искали её в день выгрузки.'],
                  ['Можно заказать только демонтаж или только перевозку?', 'Да. Но если демонтаж делают другие, мы снимаем ответственность за геометрию после сборки: без маркировки и протокола разборки предъявить претензию невозможно.'],
                  ['Как считается цена?', 'По габаритам, массе, расстоянию и сложности погрузки. После замера присылаем смету с разбивкой: транспорт, кран, демонтаж, монтаж, запуск.'],
                ].map(([q, a]) => (
                  <details className="faq" key={q}>
                    <summary>
                      {q}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div id="zayavka">
              <LeadForm source="/logistics" title="Расчёт перевозки" subtitle="Смета до выезда" cta="Отправить запрос" />
              <div className="contact-rows" style={{ marginTop: 22 }}>
                <div className="contact-row" style={{ gridTemplateColumns: '1fr' }}>
                  <span className="contact-row__label">Что прислать для расчёта</span>
                  <span className="contact-row__value" style={{ fontSize: 13.5 }}>
                    Модель или фото шильдика, адрес погрузки и выгрузки, есть ли кран на обеих сторонах. Этого достаточно
                    для первой цифры.
                  </span>
                </div>
              </div>
              <p className="form-note" style={{ marginTop: 12 }}>
                <CheckIcon size={12} className="inline-icon" /> Работаем по договору, оплата по счёту, закрывающие
                документы — в течение 3 дней после выгрузки.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

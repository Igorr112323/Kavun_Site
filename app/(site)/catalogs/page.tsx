import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { Reveal } from '@/components/reveal'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { ArrowIcon, DownloadIcon } from '@/components/icons'
import { getCatalogs, getManufacturers, getPage } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('catalogs', '/catalogs')
}

export default function CatalogsPage() {
  const page = getPage('catalogs')
  const b = page.blocks
  const catalogs = getCatalogs()
  const manufacturers = getManufacturers()

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Каталоги', path: '/catalogs' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Каталоги' },
        ]}
        title={b.hero_title}
        lead={b.hero_lead}
        meta={[
          { label: 'Документов', value: String(catalogs.length) },
          { label: 'Брендов', value: String(manufacturers.length) },
          { label: 'Формат', value: 'PDF, без регистрации' },
        ]}
      />

      <section className="section">
        <div className="container">
          <h2 className="sr-only">PDF-каталоги производителей</h2>
          <div className="cat-grid">
            {catalogs.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 60}>
                <article className="cat-card">
                  <div className="cat-card__cover">
                    <Image
                      src={cat.cover || '/images/og-default.jpg'}
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
                    {cat.pdf_url ? (
                      <a className="cat-card__dl" href={cat.pdf_url} download>
                        <DownloadIcon size={13} />
                        Скачать PDF · {cat.file_size}
                      </a>
                    ) : (
                      <span className="cat-card__dl" style={{ opacity: 0.5 }}>Файл готовится</span>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="catalogue__note" style={{ marginTop: 40 }}>
            <div>
              <b>Как читать каталоги</b>
              Технические таблицы — в конце
            </div>
            <p>{b.note}</p>
          </div>

          <div className="contact-strip" style={{ marginTop: 40 }}>
            <div>
              <span className="label label--accent">Нужна выписка по модели</span>
              <h2 style={{ marginTop: 10, maxWidth: '18ch' }}>Пришлём страницы с характеристиками и планировкой</h2>
              <p className="muted" style={{ marginTop: 12, fontSize: 14, maxWidth: '52ch' }}>
                Если не хочется читать 180 страниц — скажите модель и задачу. Отправим 3–4 страницы по делу и посчитаем
                комплектацию под ваш профиль.
              </p>
            </div>
            <div className="contact-strip__actions">
              <Link href="/contacts#zayavka" className="btn btn--ink">
                Запросить выписку
                <ArrowIcon size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

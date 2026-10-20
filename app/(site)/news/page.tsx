import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHead } from '@/components/page-head'
import { Reveal } from '@/components/reveal'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { ArrowIcon } from '@/components/icons'
import { getPosts } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('home', '/news', {
    title: 'Новости и поступления',
    description: 'Что поступило на склад, что ремонтировали и куда перевозили — короткие заметки из цеха.',
  })
}

export default function NewsPage() {
  const posts = getPosts()
  const [lead, ...rest] = posts

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Новости', path: '/news' },
        ]}
      />
      <PageHead
        crumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Новости' },
        ]}
        title="Новости и поступления"
        lead="Короткие заметки из цеха и со склада: что приехало, что починили, что выяснили по пути. Без пресс-релизов и «успешно приняли участие»."
        meta={[
          { label: 'Записей', value: String(posts.length) },
          { label: 'Периодичность', value: 'по событиям' },
        ]}
      />

      <section className="section section--tight">
        <div className="container">
          {lead && (
            <Reveal>
              <Link href={`/news/${lead.slug}`} className="news-feature">
                <div className="news-feature__media">
                  {lead.cover && (
                    <Image src={lead.cover} alt={lead.title} fill sizes="(max-width: 980px) 100vw, 56vw" style={{ objectFit: 'cover' }} />
                  )}
                </div>
                <div className="news-feature__body">
                  <span className="label label--accent">Свежее · {formatDate(lead.published_at)}</span>
                  <h2>{lead.title}</h2>
                  <p>{lead.excerpt}</p>
                  <span className="textlink">
                    Читать
                    <ArrowIcon size={12} />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="news-list" style={{ marginTop: 40 }}>
            {rest.map((post, i) => (
              <Reveal key={post.id} delay={i * 50}>
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
    </>
  )
}

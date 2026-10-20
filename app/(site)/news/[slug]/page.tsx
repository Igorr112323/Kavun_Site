import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/page-head'
import { ProseBody } from '@/components/prose-body'
import { LeadForm } from '@/components/lead-form'
import { ArrowIcon } from '@/components/icons'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { getPostBySlug, getPosts } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Новость не найдена' }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: 'article',
      locale: 'ru_RU',
      title: post.title,
      description: post.excerpt ?? undefined,
      url: absoluteUrl(`/news/${post.slug}`),
      images: post.cover ? [{ url: post.cover, width: 1200, height: 630, alt: post.title }] : undefined,
    },
  }
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()
  const other = getPosts(4).filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Новости', path: '/news' },
          { name: post.title, path: `/news/${post.slug}` },
        ]}
      />
      <article className="article">
        <div className="container">
          <div className="article__head">
            <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { href: '/news', label: 'Новости' }, { label: formatDate(post.published_at) }]} />
            <div className="article__meta">
              <span>{formatDate(post.published_at, 'long')}</span>
              <span>Заметка из цеха</span>
            </div>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="lead">{post.excerpt}</p>}
          </div>

          {post.cover && (
            <div className="article__cover">
              <Image src={post.cover} alt={post.title} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
            </div>
          )}

          <div className="article__body prose">
            <ProseBody text={post.body ?? ''} />
          </div>

          <div className="article__foot">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/news" className="textlink">
                Все новости
                <ArrowIcon size={12} />
              </Link>
              <Link href="/used" className="textlink">
                Что сейчас на складе
                <ArrowIcon size={12} />
              </Link>
            </div>
            <span className="label">Материал подготовил инженер сервиса</span>
          </div>

          <div style={{ marginTop: 44, maxWidth: 760 }}>
            <LeadForm source={`/news/${post.slug}`} title="Если станок ведёт себя так же" subtitle="Опишите симптом" cta="Задать вопрос" />
          </div>

          {other.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 16 }}>Ещё из цеха</h2>
              <div className="news-list">
                {other.map((p) => (
                  <article className="news-row" key={p.id}>
                    <span className="news-row__date">{formatDate(p.published_at)}</span>
                    <h3 className="news-row__title" style={{ fontSize: '1.15rem' }}>
                      <Link href={`/news/${p.slug}`}>{p.title}</Link>
                    </h3>
                    <span className="news-row__excerpt">{p.excerpt}</span>
                    <span className="news-row__arrow" aria-hidden="true">
                      <ArrowIcon size={13} />
                    </span>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  )
}

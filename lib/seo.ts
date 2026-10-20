import type { Metadata } from 'next'
import { getPage, getSettings } from './data'

export function siteUrl(): string {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildMetadata(slug: string, path: string, extra?: Partial<Metadata>): Metadata {
  const page = getPage(slug)
  const settings = getSettings()
  const title = page.seo_title || page.title
  const description = page.seo_description || settings.site_tagline
  return {
    // seo_title в PAGE_DEFS уже содержит бренд, поэтому шаблон `%s · Vip-service`
    // здесь не нужен — иначе получается «… · Vip-service · Vip-service».
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: settings.site_name,
      title: title ?? undefined,
      description: description ?? undefined,
      url: absoluteUrl(path),
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: title ?? 'Vip-service' }],
    },
    twitter: { card: 'summary_large_image', title: title ?? undefined, description: description ?? undefined },
    ...extra,
  }
}

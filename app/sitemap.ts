import type { MetadataRoute } from 'next'
import { getDb } from '@/lib/db'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const now = new Date()
  const staticPaths = ['/', '/new', '/used', '/service', '/logistics', '/catalogs', '/company', '/contacts', '/news', '/privacy']
  const equipment = getDb().prepare('SELECT slug, updated_at FROM equipment WHERE is_published = 1').all() as {
    slug: string
    updated_at: string
  }[]
  const posts = getDb().prepare('SELECT slug, published_at FROM posts WHERE is_published = 1').all() as {
    slug: string
    published_at: string
  }[]

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.8,
    })),
    ...equipment.map((item) => ({
      url: `${base}/equipment/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${base}/news/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}

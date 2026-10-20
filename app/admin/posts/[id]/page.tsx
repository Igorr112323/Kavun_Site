import { notFound } from 'next/navigation'
import { AdminHead, Flash } from '@/components/admin-ui'
import { PostForm } from '@/components/admin/post-form'
import { getDb } from '@/lib/db'
import type { Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { id } = await params
  const { saved, error } = await searchParams
  const post = getDb().prepare('SELECT * FROM posts WHERE id = ?').get(Number(id)) as Post | undefined
  if (!post) notFound()
  const equipment = getDb().prepare('SELECT id, title FROM equipment ORDER BY title').all() as { id: number; title: string }[]

  return (
    <>
      <AdminHead title="Новость" subtitle={`/${post.slug}`} />
      <Flash saved={saved} error={error} />
      <PostForm post={post} equipment={equipment} />
    </>
  )
}

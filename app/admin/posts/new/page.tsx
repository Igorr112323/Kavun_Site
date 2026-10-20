import { AdminHead } from '@/components/admin-ui'
import { PostForm } from '@/components/admin/post-form'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  const equipment = getDb().prepare('SELECT id, title FROM equipment ORDER BY title').all() as { id: number; title: string }[]
  return (
    <>
      <AdminHead title="Новая новость" subtitle="Пишите как инженер: что случилось, что сделали, чем это полезно клиенту." />
      <PostForm equipment={equipment} />
    </>
  )
}

import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deletePost, togglePostPublished } from '@/lib/actions/admin'
import { getDb } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Row = {
  id: number
  title: string
  slug: string
  published_at: string
  is_published: number
  is_pinned: number
  equipment: string | null
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams
  const rows = getDb()
    .prepare(
      `SELECT p.id, p.title, p.slug, p.published_at, p.is_published, p.is_pinned, e.title as equipment
       FROM posts p LEFT JOIN equipment e ON e.id = p.equipment_id
       ORDER BY p.published_at DESC, p.id DESC`
    )
    .all() as Row[]

  return (
    <>
      <AdminHead
        title="Новости"
        subtitle="Короткие заметки: что поступило, что ремонтировали, что выяснили. Новость может быть привязана к карточке станка."
        actions={
          <Link href="/admin/posts/new" className="btn btn--primary btn--sm">
            + Новость
          </Link>
        }
      />
      <Flash saved={saved} error={error} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Заголовок</th>
              <th>Карточка</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="num">{formatDate(row.published_at)}</td>
                <td>
                  <span className="admin-table__title">
                    <b>{row.title}</b>
                    <span>/{row.slug}</span>
                  </span>
                </td>
                <td style={{ maxWidth: 220, fontSize: 12.5, color: 'var(--muted)' }}>{row.equipment ?? '—'}</td>
                <td>
                  <span className={`pill ${row.is_published ? 'pill--stock' : 'pill--closed'}`}>
                    {row.is_published ? 'опубликовано' : 'черновик'}
                  </span>
                  {row.is_pinned ? <span className="pill" style={{ marginLeft: 4 }}>закреплено</span> : null}
                </td>
                <td>
                  <div className="admin-table__actions">
                    <Link href={`/admin/posts/${row.id}`} className="admin-link">
                      Изменить
                    </Link>
                    <form action={togglePostPublished}>
                      <input type="hidden" name="id" value={row.id} />
                      <button type="submit" className="admin-link">
                        {row.is_published ? 'Снять' : 'Опубликовать'}
                      </button>
                    </form>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={row.id} />
                      <ConfirmButton message={`Удалить новость «${row.title}»?`}>Удалить</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="admin-empty">Новостей пока нет. Первая заметка — про поступление на склад.</div>}
      </div>
    </>
  )
}

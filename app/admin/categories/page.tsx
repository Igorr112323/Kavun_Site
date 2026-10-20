import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deleteCategory, saveCategory } from '@/lib/actions/admin'
import { getCategories } from '@/lib/data'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; error?: string }>
}) {
  const { edit, saved, error } = await searchParams
  const categories = getCategories()
  const editing = edit ? categories.find((c) => c.id === Number(edit)) : undefined
  const counts = getDb()
    .prepare('SELECT category_id, COUNT(*) as n FROM equipment GROUP BY category_id')
    .all() as { category_id: number | null; n: number }[]
  const countFor = (id: number) => counts.find((c) => c.category_id === id)?.n ?? 0

  return (
    <>
      <AdminHead
        title="Категории каталога"
        subtitle="Разделы фильтра на страницах «Новое» и «Б/У». Меньше пяти категорий — клиенту проще выбрать."
        actions={
          editing ? (
            <Link href="/admin/categories" className="btn btn--ghost btn--sm">
              Отменить редактирование
            </Link>
          ) : undefined
        }
      />
      <Flash saved={saved} error={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 380px)', gap: 16, alignItems: 'start' }}>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Короткое</th>
                <th>Карточек</th>
                <th>Порядок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="admin-table__title">
                      <b>{c.title}</b>
                      <span>/{c.slug}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{c.short_title ?? '—'}</td>
                  <td className="num">{countFor(c.id)}</td>
                  <td className="num">{c.sort}</td>
                  <td>
                    <div className="admin-table__actions">
                      <Link href={`/admin/categories?edit=${c.id}`} className="admin-link">
                        Изменить
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Удалить категорию «${c.title}»? У карточек категория станет пустой.`}>
                          Удалить
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="admin-empty">Категорий нет — добавьте первую справа.</div>}
        </div>

        <form action={saveCategory} className="admin-card admin-form" style={{ margin: 0 }}>
          <div className="admin-card__head">
            <h2>{editing ? 'Правка категории' : 'Новая категория'}</h2>
          </div>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="field">
            <label className="field__label" htmlFor="title">
              Название
            </label>
            <input id="title" name="title" className="input" defaultValue={editing?.title} required placeholder="Обрабатывающие центры с ЧПУ" />
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="short_title">
                Короткое (для фильтра)
              </label>
              <input id="short_title" name="short_title" className="input" defaultValue={editing?.short_title ?? ''} placeholder="Центры ЧПУ" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="sort">
                Порядок
              </label>
              <input id="sort" name="sort" type="number" className="input" defaultValue={editing?.sort ?? 100} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="slug">
              Адрес
            </label>
            <input id="slug" name="slug" className="input" defaultValue={editing?.slug} placeholder="генерируется из названия" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="description">
              Описание
            </label>
            <textarea id="description" name="description" className="textarea" rows={3} defaultValue={editing?.description ?? ''} />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            {editing ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      </div>
    </>
  )
}

import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deleteManufacturer, saveManufacturer } from '@/lib/actions/admin'
import { getManufacturers } from '@/lib/data'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminManufacturersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; error?: string }>
}) {
  const { edit, saved, error } = await searchParams
  const manufacturers = getManufacturers()
  const editing = edit ? manufacturers.find((m) => m.id === Number(edit)) : undefined
  const counts = getDb()
    .prepare('SELECT manufacturer_id, COUNT(*) as n FROM equipment GROUP BY manufacturer_id')
    .all() as { manufacturer_id: number | null; n: number }[]

  return (
    <>
      <AdminHead
        title="Производители"
        subtitle="Бренды, которые показываются в карточках и на странице «О компании»."
        actions={
          editing ? (
            <Link href="/admin/manufacturers" className="btn btn--ghost btn--sm">
              Отменить редактирование
            </Link>
          ) : undefined
        }
      />
      <Flash saved={saved} error={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 400px)', gap: 16, alignItems: 'start' }}>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Бренд</th>
                <th>Страна</th>
                <th>Карточек</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="admin-table__title">
                      <b>{m.name}</b>
                      <span>/{m.slug}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{m.country ?? '—'}</td>
                  <td className="num">{counts.find((c) => c.manufacturer_id === m.id)?.n ?? 0}</td>
                  <td>
                    <div className="admin-table__actions">
                      <Link href={`/admin/manufacturers?edit=${m.id}`} className="admin-link">
                        Изменить
                      </Link>
                      <form action={deleteManufacturer}>
                        <input type="hidden" name="id" value={m.id} />
                        <ConfirmButton message={`Удалить бренд «${m.name}»?`}>Удалить</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={saveManufacturer} className="admin-card admin-form" style={{ margin: 0 }}>
          <div className="admin-card__head">
            <h2>{editing ? 'Правка бренда' : 'Новый бренд'}</h2>
          </div>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="name">
                Название
              </label>
              <input id="name" name="name" className="input" defaultValue={editing?.name} required placeholder="Emmegi" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="country">
                Страна / город
              </label>
              <input id="country" name="country" className="input" defaultValue={editing?.country ?? ''} placeholder="Италия, Солароло" />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="founded">
                Год основания
              </label>
              <input id="founded" name="founded" className="input" defaultValue={editing?.founded ?? ''} placeholder="с 1970 года" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="sort">
                Порядок
              </label>
              <input id="sort" name="sort" type="number" className="input" defaultValue={editing?.sort ?? 100} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="site_url">
              Сайт
            </label>
            <input id="site_url" name="site_url" className="input" defaultValue={editing?.site_url ?? ''} placeholder="https://" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="summary">
              Описание
            </label>
            <textarea id="summary" name="summary" className="textarea" rows={3} defaultValue={editing?.summary ?? ''} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="note">
              Заметка про сервис и запчасти
            </label>
            <textarea id="note" name="note" className="textarea" rows={2} defaultValue={editing?.note ?? ''} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="slug">
              Адрес
            </label>
            <input id="slug" name="slug" className="input" defaultValue={editing?.slug} />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            {editing ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      </div>
    </>
  )
}

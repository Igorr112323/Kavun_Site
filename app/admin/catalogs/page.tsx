import Link from 'next/link'
import Image from 'next/image'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { CoverField, FileField } from '@/components/admin/media'
import { deleteCatalog, saveCatalog } from '@/lib/actions/admin'
import { getCatalogs, getManufacturers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function AdminCatalogsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; error?: string }>
}) {
  const { edit, saved, error } = await searchParams
  const catalogs = getCatalogs()
  const manufacturers = getManufacturers()
  const editing = edit ? catalogs.find((c) => c.id === Number(edit)) : undefined

  return (
    <>
      <AdminHead
        title="Каталоги PDF"
        subtitle="Обложки и файлы. Скачивание — без регистрации; после загрузки проверьте, что PDF открывается."
        actions={
          editing ? (
            <Link href="/admin/catalogs" className="btn btn--ghost btn--sm">
              Отменить редактирование
            </Link>
          ) : undefined
        }
      />
      <Flash saved={saved} error={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: 16, alignItems: 'start' }}>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Обложка</th>
                <th>Каталог</th>
                <th>Бренд</th>
                <th>Файл</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {catalogs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ width: 60, height: 45, position: 'relative', overflow: 'hidden', background: 'var(--ink-3)' }}>
                      {c.cover && <Image src={c.cover} alt="" fill sizes="60px" style={{ objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td>
                    <span className="admin-table__title">
                      <b>{c.title}</b>
                      <span>{c.pages_label} · {c.file_size}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{c.manufacturer?.name ?? '—'}</td>
                  <td>
                    {c.pdf_url ? (
                      <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="admin-link">
                        Открыть PDF
                      </a>
                    ) : (
                      <span className="pill pill--closed">нет файла</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <Link href={`/admin/catalogs?edit=${c.id}`} className="admin-link">
                        Изменить
                      </Link>
                      <form action={deleteCatalog}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Удалить каталог «${c.title}»?`}>Удалить</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={saveCatalog} className="admin-card admin-form" style={{ margin: 0 }}>
          <div className="admin-card__head">
            <h2>{editing ? 'Правка каталога' : 'Новый каталог'}</h2>
          </div>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="field">
            <label className="field__label" htmlFor="title">
              Название
            </label>
            <input id="title" name="title" className="input" defaultValue={editing?.title} required />
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="manufacturer_id">
                Бренд
              </label>
              <select id="manufacturer_id" name="manufacturer_id" className="select" defaultValue={editing?.manufacturer_id ?? ''}>
                <option value="">—</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="year">
                Год
              </label>
              <input id="year" name="year" type="number" className="input" defaultValue={editing?.year ?? new Date().getFullYear()} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label className="field__label" htmlFor="pages_label">
                Страниц
              </label>
              <input id="pages_label" name="pages_label" className="input" defaultValue={editing?.pages_label ?? ''} placeholder="180 страниц" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="file_size">
                Размер
              </label>
              <input id="file_size" name="file_size" className="input" defaultValue={editing?.file_size ?? ''} placeholder="9,4 МБ" />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="description">
              Описание
            </label>
            <textarea id="description" name="description" className="textarea" rows={3} defaultValue={editing?.description ?? ''} />
          </div>
          <CoverField initial={editing?.cover} />
          <FileField
            name="pdf_url"
            initial={editing?.pdf_url}
            label="PDF-файл"
            accept="application/pdf"
            folder="каталог"
            hint="До 12 МБ. После сохранения откройте ссылку и проверьте нумерацию страниц."
          />
          <div className="field">
            <label className="field__label" htmlFor="sort">
              Порядок
            </label>
            <input id="sort" name="sort" type="number" className="input" defaultValue={editing?.sort ?? 100} />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            {editing ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      </div>
    </>
  )
}

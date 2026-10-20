import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deleteRequest, updateRequest } from '@/lib/actions/admin'
import { getRequests } from '@/lib/data'
import { formatDateTime, REQUEST_STATUS_LABEL } from '@/lib/utils'
import type { RequestStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string; error?: string }>
}) {
  const { status, saved, error } = await searchParams
  const all = getRequests(500)
  const rows = status && ['new', 'in_progress', 'closed'].includes(status) ? all.filter((r) => r.status === status) : all
  const fresh = all.filter((r) => r.status === 'new').length

  return (
    <>
      <AdminHead
        title="Заявки"
        subtitle={`${all.length} всего, ${fresh} новых. Статус и комментарий сохраняются отдельно по каждой заявке.`}
        actions={
          <a href="/admin/requests/export" className="btn btn--ghost btn--sm">
            Экспорт CSV
          </a>
        }
      />
      <Flash saved={saved} error={error} />

      <form className="admin-toolbar" method="get">
        <select className="select" name="status" defaultValue={status ?? ''}>
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="in_progress">В работе</option>
          <option value="closed">Закрытые</option>
        </select>
        <button type="submit" className="btn btn--ink btn--sm">
          Фильтр
        </button>
        {status && (
          <Link href="/admin/requests" className="admin-link">
            Сбросить
          </Link>
        )}
        <span className="admin-toolbar__spacer" />
        <span className="label">Показано: {rows.length}</span>
      </form>

      <div className="table-wrap">
        <table className="admin-table" style={{ minWidth: 980 }}>
          <thead>
            <tr>
              <th>Когда</th>
              <th>Клиент</th>
              <th>Сообщение</th>
              <th>Источник</th>
              <th>Статус и комментарий</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ background: r.status === 'new' ? 'rgba(255,77,18,.035)' : undefined }}>
                <td className="num" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.created_at)}</td>
                <td>
                  <span className="admin-table__title">
                    <b>{r.name}</b>
                    <span>{r.phone}{r.email ? ` · ${r.email}` : ''}</span>
                  </span>
                </td>
                <td>
                  <span className="request-message">{r.message || '—'}</span>
                  {r.equipment_title && (
                    <span className="label" style={{ display: 'block', marginTop: 4 }}>
                      → {r.equipment_title}
                    </span>
                  )}
                </td>
                <td className="num" style={{ whiteSpace: 'nowrap', fontSize: 10.5 }}>{r.source_page}</td>
                <td>
                  <form action={updateRequest} style={{ display: 'grid', gap: 6, minWidth: 220 }}>
                    <input type="hidden" name="id" value={r.id} />
                    <span className={`pill pill--${r.status}`}>{REQUEST_STATUS_LABEL[r.status as RequestStatus]}</span>
                    <select name="status" className="request-note" defaultValue={r.status} aria-label="Статус заявки">
                      <option value="new">Новая</option>
                      <option value="in_progress">В работе</option>
                      <option value="closed">Закрыта</option>
                    </select>
                    <textarea
                      name="manager_note"
                      className="request-note"
                      rows={2}
                      defaultValue={r.manager_note ?? ''}
                      placeholder="Комментарий: что ответили, когда перезвонить"
                      aria-label="Комментарий менеджера"
                    />
                    <button type="submit" className="btn btn--ink btn--sm" style={{ minHeight: 32, padding: '6px 10px', fontSize: 9 }}>
                      Сохранить
                    </button>
                  </form>
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <form action={deleteRequest}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Удалить заявку? Данные клиента будут потеряны.">Удалить</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="admin-empty">Заявок с таким статусом нет.</div>}
      </div>

      <div className="admin-note admin-note--info" style={{ marginTop: 16 }}>
        Экспорт CSV открывается в Excel: разделитель — точка с запятой, кодировка UTF-8 с BOM. Форма на сайте защищена
        от спама скрытым полем, тайм-трапом и лимитом отправок.
      </div>
    </>
  )
}

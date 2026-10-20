import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { getAdminCounts, getRequests } from '@/lib/data'
import { formatDateTime, REQUEST_STATUS_LABEL, formatPrice, STATUS_LABEL } from '@/lib/utils'
import { getDb } from '@/lib/db'
import type { EquipmentStatus, RequestStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams
  const counts = getAdminCounts()
  const requests = getRequests(6)
  const equipment = getDb()
    .prepare(
      `SELECT e.id, e.title, e.slug, e.price, e.price_on_request, e.status, e.is_published, e.updated_at,
              m.name as manufacturer
       FROM equipment e LEFT JOIN manufacturers m ON m.id = e.manufacturer_id
       ORDER BY e.updated_at DESC, e.id DESC LIMIT 5`
    )
    .all() as {
    id: number
    title: string
    slug: string
    price: number | null
    price_on_request: number
    status: EquipmentStatus
    is_published: number
    updated_at: string
    manufacturer: string | null
  }[]

  return (
    <>
      <AdminHead
        title="Сводка"
        subtitle="Что происходит на складе и в заявках. Данные обновляются сразу после сохранения."
        actions={
          <>
            <Link href="/admin/equipment/new" className="btn btn--primary btn--sm">
              + Оборудование
            </Link>
            <Link href="/admin/requests" className="btn btn--ghost btn--sm">
              Заявки
            </Link>
          </>
        }
      />
      <Flash saved={saved} error={error} />

      <div className="admin-grid">
        <div className="admin-stat">
          <span>Оборудование</span>
          <b>{counts.equipment}</b>
          <small>из них б/у — {counts.used}</small>
        </div>
        <div className="admin-stat admin-stat--accent">
          <span>Новые заявки</span>
          <b>{counts.requests.fresh}</b>
          <small>всего {counts.requests.total}, сегодня {counts.requests.today}</small>
        </div>
        <div className="admin-stat">
          <span>Новости</span>
          <b>{counts.posts}</b>
          <small>опубликовано и в черновиках</small>
        </div>
        <div className="admin-stat">
          <span>В работе</span>
          <b>{counts.requests.in_progress}</b>
          <small>закрыто — {counts.requests.closed}</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.65fr)', gap: 16, alignItems: 'start' }}>
        <div className="admin-card admin-card--flush">
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, textTransform: 'uppercase' }}>Последние заявки</h2>
            <Link href="/admin/requests" className="admin-link">
              Все заявки
            </Link>
          </div>
          {requests.length === 0 ? (
            <div className="admin-empty">Заявок пока нет. Проверьте форму на сайте — она должна работать.</div>
          ) : (
            <div className="table-wrap" style={{ border: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Клиент</th>
                    <th>Интерес</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="num">{formatDateTime(r.created_at)}</td>
                      <td>
                        <span className="admin-table__title">
                          <b>{r.name}</b>
                          <span>{r.phone}</span>
                        </span>
                      </td>
                      <td style={{ maxWidth: 240 }}>
                        <span className="request-message">{r.equipment_title ?? r.message ?? r.source_page}</span>
                      </td>
                      <td>
                        <span className={`pill pill--${r.status}`}>{REQUEST_STATUS_LABEL[r.status as RequestStatus]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card__head">
            <h2>Перед публикацией</h2>
          </div>
          <ol style={{ listStyle: 'none', display: 'grid', gap: 12, padding: 0, margin: 0 }}>
            {[
              ['Фото', 'Минимум 2 фото, первое — обложка 4:3. Без чужих логотипов и водяных знаков.'],
              ['Цена', 'Либо конкретная, либо «по запросу». «Договорная» путает клиента.'],
              ['Наличие', 'Сверьте со складом: статус в карточке — это обещание, а не украшение.'],
              ['Б/у', 'Заполните «состояние»: что заменили, что осталось. Без этого карточка не публикуется.'],
            ].map(([t, d], i) => (
              <li key={t} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-deep)', paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <b>{t}.</b> <span style={{ color: 'var(--muted)' }}>{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="admin-card admin-card--flush" style={{ marginTop: 16 }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, textTransform: 'uppercase' }}>Недавно меняли</h2>
          <Link href="/admin/equipment" className="admin-link">
            Весь склад
          </Link>
        </div>
        <div className="table-wrap" style={{ border: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Карточка</th>
                <th>Цена</th>
                <th>Наличие</th>
                <th>Публикация</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {equipment.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="admin-table__title">
                      <b>{e.title}</b>
                      <span>{e.manufacturer ?? 'без бренда'}</span>
                    </span>
                  </td>
                  <td className="num">{e.price_on_request || e.price == null ? 'по запросу' : formatPrice(e.price)}</td>
                  <td>
                    <span className={`pill pill--${e.status === 'in_stock' ? 'stock' : e.status === 'on_order' ? 'order' : e.status === 'in_transit' ? 'transit' : e.status === 'reserved' ? 'reserved' : 'sold'}`}>
                      {STATUS_LABEL[e.status]}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${e.is_published ? 'pill--stock' : 'pill--closed'}`}>
                      {e.is_published ? 'на сайте' : 'черновик'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/equipment/${e.id}`} className="admin-link">
                      Изменить
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

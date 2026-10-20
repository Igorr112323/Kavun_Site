import Link from 'next/link'
import Image from 'next/image'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deleteEquipment, toggleEquipmentPublished } from '@/lib/actions/admin'
import { getDb } from '@/lib/db'
import { CONDITION_LABEL, STATUS_LABEL, formatPrice, parseImages } from '@/lib/utils'
import type { Condition, EquipmentStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Row = {
  id: number
  title: string
  slug: string
  model: string | null
  condition: Condition
  status: EquipmentStatus
  price: number | null
  price_on_request: number
  is_published: number
  is_featured: number
  images: string
  manufacturer: string | null
  category: string | null
}

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; condition?: string; status?: string; saved?: string; error?: string }>
}) {
  const { q, condition, status, saved, error } = await searchParams
  const where: string[] = ['1=1']
  const params: Record<string, string> = {}
  if (q) {
    where.push('(e.title LIKE @q OR e.model LIKE @q OR m.name LIKE @q)')
    params.q = `%${q}%`
  }
  if (condition === 'new' || condition === 'used') {
    where.push('e.condition = @condition')
    params.condition = condition
  }
  if (status) {
    where.push('e.status = @status')
    params.status = status
  }

  const rows = getDb()
    .prepare(
      `SELECT e.id, e.title, e.slug, e.model, e.condition, e.status, e.price, e.price_on_request,
              e.is_published, e.is_featured, e.images, m.name as manufacturer, c.title as category
       FROM equipment e
       LEFT JOIN manufacturers m ON m.id = e.manufacturer_id
       LEFT JOIN categories c ON c.id = e.category_id
       WHERE ${where.join(' AND ')}
       ORDER BY e.sort, e.id`
    )
    .all(params) as Row[]

  return (
    <>
      <AdminHead
        title="Оборудование"
        subtitle="Карточки склада. Скрытые с сайта остаются в базе как черновики — их видно только здесь."
        actions={
          <Link href="/admin/equipment/new" className="btn btn--primary btn--sm">
            + Добавить карточку
          </Link>
        }
      />
      <Flash saved={saved} error={error} />

      <form className="admin-toolbar" method="get">
        <input className="input" name="q" defaultValue={q} placeholder="Поиск по названию, модели, бренду" />
        <select className="select" name="condition" defaultValue={condition ?? ''}>
          <option value="">Все состояния</option>
          <option value="new">Новое</option>
          <option value="used">Б/У</option>
        </select>
        <select className="select" name="status" defaultValue={status ?? ''}>
          <option value="">Любое наличие</option>
          <option value="in_stock">В наличии</option>
          <option value="in_transit">В пути</option>
          <option value="on_order">Под заказ</option>
          <option value="reserved">Зарезервировано</option>
          <option value="sold">Продано</option>
        </select>
        <button type="submit" className="btn btn--ink btn--sm">
          Применить
        </button>
        {(q || condition || status) && (
          <Link href="/admin/equipment" className="admin-link">
            Сбросить
          </Link>
        )}
        <span className="admin-toolbar__spacer" />
        <span className="label">Найдено: {rows.length}</span>
      </form>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>Название</th>
              <th>Бренд / категория</th>
              <th>Состояние</th>
              <th>Наличие</th>
              <th>Цена</th>
              <th>Сайт</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const images = parseImages(row.images)
              return (
                <tr key={row.id}>
                  <td style={{ width: 64 }}>
                    <div style={{ width: 52, height: 40, position: 'relative', overflow: 'hidden', background: 'var(--ink-3)' }}>
                      {images[0] && <Image src={images[0]} alt="" fill sizes="52px" style={{ objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td>
                    <span className="admin-table__title">
                      <b>{row.title}</b>
                      <span>{row.model ?? row.slug}</span>
                    </span>
                  </td>
                  <td>
                    <span className="admin-table__title">
                      <b style={{ fontWeight: 500 }}>{row.manufacturer ?? '—'}</b>
                      <span>{row.category ?? 'без категории'}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`pill pill--${row.condition === 'used' ? 'used' : 'new-cond'}`}>
                      {CONDITION_LABEL[row.condition]}
                    </span>
                  </td>
                  <td>
                    <span className={`pill pill--${row.status === 'in_stock' ? 'stock' : row.status === 'on_order' ? 'order' : row.status === 'in_transit' ? 'transit' : row.status === 'reserved' ? 'reserved' : 'sold'}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="num">{row.price_on_request || row.price == null ? 'по запросу' : formatPrice(row.price)}</td>
                  <td>
                    <span className={`pill ${row.is_published ? 'pill--stock' : 'pill--closed'}`}>
                      {row.is_published ? 'опубликовано' : 'черновик'}
                    </span>
                    {row.is_featured ? <span className="pill" style={{ marginLeft: 4 }}>главная</span> : null}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <Link href={`/admin/equipment/${row.id}`} className="admin-link">
                        Изменить
                      </Link>
                      <form action={toggleEquipmentPublished}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="admin-link">
                          {row.is_published ? 'Скрыть' : 'Опубликовать'}
                        </button>
                      </form>
                      <form action={deleteEquipment}>
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmButton message={`Удалить «${row.title}»? Действие необратимо.`}>Удалить</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div className="admin-empty">Ничего не найдено. Попробуйте другой запрос или сбросьте фильтры.</div>}
      </div>
    </>
  )
}

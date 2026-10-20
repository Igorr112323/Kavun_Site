import Link from 'next/link'
import { AdminHead } from '@/components/admin-ui'
import { getAllPages } from '@/lib/data'
import { formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function AdminPagesList() {
  const pages = getAllPages()
  return (
    <>
      <AdminHead
        title="Тексты страниц"
        subtitle="Заголовки, лиды и служебные подписи. Каждое поле показывает, где оно стоит на странице."
      />
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Страница</th>
              <th>Адрес</th>
              <th>Обновлено</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}>
                <td>
                  <b>{p.title}</b>
                </td>
                <td className="num">/{p.slug === 'home' ? '' : p.slug}</td>
                <td style={{ fontSize: 12.5, color: 'var(--muted)' }}>{p.updated_at ? formatDateTime(p.updated_at) : '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="admin-table__actions">
                    <a href={p.slug === 'home' ? '/' : `/${p.slug}`} target="_blank" rel="noopener noreferrer" className="admin-link">
                      Открыть ↗
                    </a>
                    <Link href={`/admin/pages/${p.slug}`} className="admin-link">
                      Редактировать
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-note admin-note--info" style={{ marginTop: 16 }}>
        Тексты карточек оборудования, новостей и каталогов редактируются в соответствующих разделах — здесь только
        страницы и SEO.
      </div>
    </>
  )
}

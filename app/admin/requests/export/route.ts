import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getRequests } from '@/lib/data'
import { REQUEST_STATUS_LABEL } from '@/lib/utils'
import type { RequestStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

function cell(value: unknown): string {
  const text = String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')
  return `"${text}"`
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })

  const rows = getRequests(5000)
  const header = ['ID', 'Дата', 'Имя', 'Телефон', 'Почта', 'Оборудование', 'Страница', 'Статус', 'Комментарий', 'Сообщение']
  const lines = [
    header.map(cell).join(';'),
    ...rows.map((r) =>
      [
        r.id,
        r.created_at,
        r.name,
        r.phone,
        r.email,
        r.equipment_title,
        r.source_page,
        REQUEST_STATUS_LABEL[r.status as RequestStatus],
        r.manager_note,
        r.message,
      ]
        .map(cell)
        .join(';')
    ),
  ]

  return new NextResponse('\uFEFF' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vip-service-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

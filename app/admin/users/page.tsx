import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminHead, Flash } from '@/components/admin-ui'
import { ConfirmButton } from '@/components/confirm-button'
import { deleteUser, saveUser, toggleUser } from '@/lib/actions/admin'
import { getCurrentUser } from '@/lib/auth'
import { getDb } from '@/lib/db'
import type { User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string; error?: string }>
}) {
  const me = await getCurrentUser()
  if (!me) redirect('/login')
  if (me.role !== 'admin') redirect('/admin')
  const { edit, saved, error } = await searchParams
  const users = getDb().prepare('SELECT * FROM users ORDER BY id').all() as (User & { password_hash: string })[]
  const editing = edit ? users.find((u) => u.id === Number(edit)) : undefined

  return (
    <>
      <AdminHead
        title="Пользователи"
        subtitle="Администратор видит всё, контент-менеджер — оборудование, новости, каталоги и заявки. Настройки и пользователи — только для админа."
        actions={
          editing ? (
            <Link href="/admin/users" className="btn btn--ghost btn--sm">
              Отменить редактирование
            </Link>
          ) : undefined
        }
      />
      <Flash saved={saved} error={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: 16, alignItems: 'start' }}>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Почта</th>
                <th>Роль</th>
                <th>Доступ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                    {u.id === me.id && <span className="pill" style={{ marginLeft: 6 }}>это вы</span>}
                  </td>
                  <td className="num" style={{ fontSize: 11.5 }}>{u.email}</td>
                  <td>
                    <span className={`pill ${u.role === 'admin' ? 'pill--new' : 'pill--closed'}`}>
                      {u.role === 'admin' ? 'администратор' : 'контент-менеджер'}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${u.is_active ? 'pill--stock' : 'pill--closed'}`}>
                      {u.is_active ? 'активен' : 'отключён'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <Link href={`/admin/users?edit=${u.id}`} className="admin-link">
                        Изменить
                      </Link>
                      {u.id !== me.id && (
                        <>
                          <form action={toggleUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <button type="submit" className="admin-link">
                              {u.is_active ? 'Отключить' : 'Включить'}
                            </button>
                          </form>
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <ConfirmButton message={`Удалить пользователя ${u.name}?`}>Удалить</ConfirmButton>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={saveUser} className="admin-card admin-form" style={{ margin: 0 }}>
          <div className="admin-card__head">
            <h2>{editing ? 'Правка доступа' : 'Новый пользователь'}</h2>
          </div>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="field">
            <label className="field__label" htmlFor="name">
              Имя
            </label>
            <input id="name" name="name" className="input" defaultValue={editing?.name} required placeholder="Анна Литвинова" />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="email">
              Почта
            </label>
            <input id="email" name="email" type="email" className="input" defaultValue={editing?.email} required />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="role">
              Роль
            </label>
            <select id="role" name="role" className="select" defaultValue={editing?.role ?? 'editor'}>
              <option value="editor">Контент-менеджер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="password">
              {editing ? 'Новый пароль (если нужно сменить)' : 'Пароль'}
            </label>
            <input id="password" name="password" type="text" className="input" placeholder="минимум 8 символов" autoComplete="new-password" />
            <span className="field__hint">Пароль задаётся вручную и не отправляется на почту — передайте его лично.</span>
          </div>
          <button type="submit" className="btn btn--primary btn--sm">
            {editing ? 'Сохранить' : 'Создать доступ'}
          </button>
        </form>
      </div>
    </>
  )
}

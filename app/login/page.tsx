import { redirect } from 'next/navigation'
import '../admin/admin.css'
import { LoginForm } from './login-form'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Вход в админку · Vip-service',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/admin')

  return (
    <div className="admin-login">
      <aside className="admin-login__aside">
        <div className="admin-login__quote">
          Склад, сервис и контент — <em>в одном окне</em>
        </div>
        <div className="admin-login__meta">
          <span>Vip-service · Краснодар</span>
          <span>Старокорсунская, Полевая 43</span>
          <span>Админ-панель · v1.0</span>
        </div>
      </aside>
      <main className="admin-login__main">
        <LoginForm showHint={process.env.NODE_ENV !== 'production'} />
      </main>
    </div>
  )
}

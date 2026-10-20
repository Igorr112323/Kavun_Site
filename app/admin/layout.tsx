import { redirect } from 'next/navigation'
import './admin.css'
import { getCurrentUser } from '@/lib/auth'
import { getAdminCounts } from '@/lib/data'
import { AdminShell } from '@/components/admin-shell'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Админка · Vip-service',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const counts = getAdminCounts()

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      counts={{ equipment: counts.equipment, posts: counts.posts, fresh: counts.requests.fresh }}
    >
      {children}
    </AdminShell>
  )
}

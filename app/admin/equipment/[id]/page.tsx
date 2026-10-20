import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminHead, Flash } from '@/components/admin-ui'
import { EquipmentForm } from '@/components/admin/equipment-form'
import { getCategories, getEquipmentById, getManufacturers } from '@/lib/data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function EditEquipmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const { id } = await params
  const { saved, error } = await searchParams
  const item = getEquipmentById(Number(id))
  if (!item) notFound()

  return (
    <>
      <AdminHead
        title={item.model ?? item.title}
        subtitle={`${item.manufacturer?.name ?? 'Без бренда'} · ${item.condition === 'used' ? 'Б/У' : 'новое'} · обновлено ${item.updated_at}`}
        actions={
          <Link href={`/admin/equipment/${item.id}`} className="admin-link">
            #{item.id}
          </Link>
        }
      />
      <Flash saved={saved} error={error} />
      <EquipmentForm item={item} categories={getCategories()} manufacturers={getManufacturers()} />
    </>
  )
}

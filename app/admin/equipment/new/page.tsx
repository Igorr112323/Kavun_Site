import { redirect } from 'next/navigation'
import { AdminHead, Flash } from '@/components/admin-ui'
import { EquipmentForm } from '@/components/admin/equipment-form'
import { getCategories, getManufacturers } from '@/lib/data'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function NewEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const { saved, error } = await searchParams

  return (
    <>
      <AdminHead title="Новая карточка" subtitle="Заполните основное, добавьте фото и характеристики. Черновик можно сохранить непубликуемым." />
      <Flash saved={saved} error={error} />
      <EquipmentForm categories={getCategories()} manufacturers={getManufacturers()} />
    </>
  )
}

import type { Metadata } from 'next'
import { CatalogueView } from '@/components/catalogue-view'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('new', '/new')
}

export default async function NewEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; manufacturer?: string; sort?: string }>
}) {
  const search = await searchParams
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Главная', path: '/' },
          { name: 'Новое оборудование', path: '/new' },
        ]}
      />
      <CatalogueView slug="new" condition="new" path="/new" title="Новое оборудование" search={search} />
    </>
  )
}

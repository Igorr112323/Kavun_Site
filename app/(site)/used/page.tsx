import type { Metadata } from 'next'
import { CatalogueView } from '@/components/catalogue-view'
import { BreadcrumbJsonLd } from '@/components/jsonld'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('used', '/used')
}

export default async function UsedEquipmentPage({
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
          { name: 'Б/У с проверкой', path: '/used' },
        ]}
      />
      <CatalogueView slug="used" condition="used" path="/used" title="Б/У с проверкой" search={search} />
    </>
  )
}

import { getSettings } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'
import type { EquipmentFull } from '@/lib/types'
import { STATUS_LABEL } from '@/lib/utils'

function Json({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function OrganizationJsonLd() {
  const s = getSettings()
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': ['Organization', 'LocalBusiness'],
        '@id': absoluteUrl('/#organization'),
        name: 'Vip-service',
        legalName: 'ООО «Вип-Сервис»',
        url: absoluteUrl('/'),
        telephone: s.phone_href,
        email: s.email,
        description:
          'Продажа, ремонт, обслуживание и перевозка промышленного оборудования для алюминиевых и пластиковых конструкций.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ст. Старокорсунская, ул. Полевая, 43',
          addressLocality: 'Краснодар',
          addressRegion: 'Краснодарский край',
          postalCode: '350910',
          addressCountry: 'RU',
        },
        geo: { '@type': 'GeoCoordinates', latitude: s.map_lat, longitude: s.map_lon },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:30',
            closes: '18:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '09:00',
            closes: '14:00',
          },
        ],
        sameAs: [s.telegram, s.whatsapp].filter(Boolean),
        makesOffer: [
          'Новое оборудование для алюминия и ПВХ',
          'Б/У оборудование с проверкой',
          'Ремонт и обслуживание станков',
          'Перевозка, демонтаж и монтаж оборудования',
        ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      }}
    />
  )
}

export function ProductJsonLd({ item }: { item: EquipmentFull }) {
  const availability =
    item.status === 'in_stock'
      ? 'https://schema.org/InStock'
      : item.status === 'on_order'
        ? 'https://schema.org/PreOrder'
        : item.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/LimitedAvailability'

  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.title,
        description: item.description?.slice(0, 500),
        sku: item.slug,
        image: (item.images_parsed.length ? item.images_parsed : ['/images/og-default.jpg']).map((src) =>
          absoluteUrl(src)
        ),
        brand: { '@type': 'Brand', name: item.manufacturer?.name ?? 'Vip-service' },
        category: item.category?.title,
        itemCondition: item.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        additionalProperty: item.specs_parsed.map((spec) => ({
          '@type': 'PropertyValue',
          name: spec.label,
          value: spec.value,
        })),
        // Offer без цены Google помечает как ошибку, поэтому для позиций
        // «цена по запросу» отдаём только Product и статус наличия.
        ...(item.price != null
          ? {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'RUB',
                price: item.price,
                availability,
                itemCondition:
                  item.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
                url: absoluteUrl(`/equipment/${item.slug}`),
                seller: { '@type': 'Organization', name: 'Vip-service', telephone: getSettings().phone_href },
              },
            }
          : {}),
      }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  )
}

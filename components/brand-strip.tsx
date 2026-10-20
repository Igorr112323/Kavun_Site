import Link from 'next/link'

const BRANDS = [
  { name: 'elumatec', country: 'Германия' },
  { name: 'Emmegi', country: 'Италия' },
  { name: 'Stürtz', country: 'Германия' },
  { name: 'Haffner', country: 'Турция' },
  { name: 'Voilàp Group', country: 'Холдинг' },
]

export function BrandStrip({ label = 'Работаем с производителями' }: { label?: string }) {
  const items = [...BRANDS, ...BRANDS]
  return (
    <div className="brands" aria-label="Производители оборудования">
      <div className="container brands__inner">
        <span className="brands__label">{label}</span>
        <div className="brands__viewport">
          <div className="brands__track">
            {items.map((b, i) => (
              <Link
                key={`${b.name}-${i}`}
                href="/catalogs"
                className="brand"
                aria-hidden={i >= BRANDS.length}
                tabIndex={i >= BRANDS.length ? -1 : undefined}
              >
                <span className="brand__name">{b.name}</span>
                <span className="brand__country">{b.country}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

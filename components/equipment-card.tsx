import Image from 'next/image'
import Link from 'next/link'
import type { EquipmentFull } from '@/lib/types'
import { CONDITION_LABEL, formatPrice, STATUS_LABEL } from '@/lib/utils'
import { ArrowIcon, CheckIcon } from './icons'
import { CompareToggle } from './compare'

export function EquipmentCard({ item, index = 0 }: { item: EquipmentFull; index?: number }) {
  const image = item.images_parsed[0] || '/images/profiles.jpg'
  const specs = item.specs_parsed.slice(0, 3)
  const isRequest = item.price_on_request === 1 || item.price == null

  return (
    <article className="eq-card" style={{ '--i': index } as React.CSSProperties}>
      <div className="eq-card__media">
        <Image
          src={image}
          alt={item.title}
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
          className="eq-card__img"
        />
        <span className="eq-card__index">
          {String(index + 1).padStart(2, '0')} / {item.condition === 'used' ? 'Б/У' : 'NEW'}
        </span>
        <span className="eq-card__status" data-status={item.status}>
          {STATUS_LABEL[item.status]}
        </span>
        {item.checked === 1 && (
          <span className="eq-card__flag">
            <CheckIcon size={9} /> Проверено, запущено
          </span>
        )}
        <CompareToggle slug={item.slug} title={item.model || item.title} />
      </div>
      <div className="eq-card__body">
        <div className="eq-card__kicker">
          <b>{item.manufacturer?.name ?? '—'}</b>
          <span>
            {CONDITION_LABEL[item.condition]}
            {item.year ? ` · ${item.year}` : ''}
          </span>
        </div>
        <h3 className="eq-card__title">
          <Link href={`/equipment/${item.slug}`}>{item.title}</Link>
        </h3>
        {specs.length > 0 && (
          <dl className="mini-specs">
            {specs.map((spec) => (
              <div className="mini-spec" key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="eq-card__foot">
        <div className={`eq-card__price${isRequest ? ' eq-card__price--request' : ''}`}>
          <b>{isRequest ? 'Цена по запросу' : formatPrice(item.price)}</b>
          <span>{isRequest ? 'ответ в течение 2 часов' : 'с НДС, Краснодар'}</span>
        </div>
        <Link href={`/equipment/${item.slug}`} className="eq-card__go" aria-label={`Открыть карточку: ${item.title}`}>
          <ArrowIcon size={13} />
        </Link>
      </div>
    </article>
  )
}

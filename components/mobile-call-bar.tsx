import Link from 'next/link'
import { PhoneIcon } from './icons'

/**
 * Липкая панель действий на телефоне: позвонить или оставить заявку.
 * Показывается только на узких экранах (CSS), на десктопе не занимает места.
 */
export function MobileCallBar({ phoneDisplay, phoneHref }: { phoneDisplay: string; phoneHref: string }) {
  return (
    <div className="mobile-call" aria-label="Быстрая связь">
      <a className="mobile-call__call" href={`tel:${phoneHref}`}>
        <PhoneIcon size={14} />
        <span>
          Позвонить
          <small>{phoneDisplay}</small>
        </span>
      </a>
      <Link className="mobile-call__order" href="/contacts#zayavka">
        Оставить заявку
      </Link>
    </div>
  )
}

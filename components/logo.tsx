import { cn } from '@/lib/utils'

type LogoProps = {
  variant?: string
  className?: string
  withText?: boolean
  compact?: boolean
}

export function LogoMark({ variant = 'profile', className }: { variant?: string; className?: string }) {
  if (variant === 'groove') {
    return (
      <svg viewBox="0 0 32 32" className={cn('logo__mark', className)} fill="none" aria-hidden="true">
        <path d="M3 6h26v20H3z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 11h26M3 21h26" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        <path d="M11 6l5 7 5-7" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 13v4" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <circle cx="16" cy="19.5" r="2.2" className="fill-accent" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" className={cn('logo__mark', className)} fill="none" aria-hidden="true">
      <path d="M3 3h26v26H3z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 9h14v14H9z" stroke="currentColor" strokeWidth="1.1" opacity="0.42" />
      <path d="M16 3v6M16 23v6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M23 9h6" stroke="currentColor" strokeWidth="1.7" className="mark-accent" />
      <path d="M23 3v6" stroke="currentColor" strokeWidth="1.7" className="mark-accent" />
      <path d="M3 23h6" stroke="currentColor" strokeWidth="1.1" opacity="0.42" />
    </svg>
  )
}

export function Logo({ variant = 'profile', className, withText = true, compact = false }: LogoProps) {
  return (
    <span className={cn('logo', className)}>
      <LogoMark variant={variant} className="logo__mark" />
      {withText && (
        <span className="logo__text">
          <span className="logo__name">Vip-service</span>
          {!compact && <span className="logo__sub">промышленное оборудование · краснодар</span>}
        </span>
      )}
    </span>
  )
}

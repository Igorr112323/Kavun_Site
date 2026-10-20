'use client'

import { cn } from '@/lib/utils'

export function ConfirmButton({
  children,
  message = 'Удалить без возможности восстановления?',
  className,
}: {
  children: React.ReactNode
  message?: string
  className?: string
}) {
  return (
    <button
      type="submit"
      className={cn('admin-link admin-link--danger', className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}

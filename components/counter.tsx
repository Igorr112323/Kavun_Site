'use client'

import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '@/lib/utils'

export function Counter({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return
        started.current = true
        const duration = 1200
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className={className}>
      {formatNumber(display)}
      {suffix && <span className="stat__suffix">{suffix}</span>}
    </span>
  )
}

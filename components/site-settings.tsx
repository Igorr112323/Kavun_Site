'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Настройки, которые нужны клиентским компонентам (формам, меню, кнопкам).
 * Приходят из базы один раз в layout — вместо того чтобы дублировать телефон
 * и почту строкой в каждом файле.
 */
export type PublicSettings = {
  phoneDisplay: string
  phoneHref: string
  email: string
}

const FALLBACK: PublicSettings = {
  phoneDisplay: '+7 (988) 000-00-00',
  phoneHref: '+79880000000',
  email: 'zakaz@vip-service23.ru',
}

const SiteSettingsContext = createContext<PublicSettings>(FALLBACK)

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: Partial<PublicSettings>
  children: ReactNode
}) {
  return (
    <SiteSettingsContext.Provider value={{ ...FALLBACK, ...value }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings(): PublicSettings {
  return useContext(SiteSettingsContext)
}

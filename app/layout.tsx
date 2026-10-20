import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/oswald'
import '@fontsource-variable/onest'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Vip-service — оборудование для алюминия и ПВХ, Краснодар',
    template: '%s · Vip-service',
  },
  description:
    'Продажа, ремонт и перевозка промышленного оборудования для алюминиевых и пластиковых конструкций. Склад в Краснодаре, выезд по ЮФО.',
  applicationName: 'Vip-service',
  authors: [{ name: 'Vip-service' }],
  creator: 'Vip-service',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Vip-service',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Vip-service — станки для алюминия и ПВХ' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#101310',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

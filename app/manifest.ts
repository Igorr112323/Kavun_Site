import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vip-service — оборудование для алюминия и ПВХ',
    short_name: 'Vip-service',
    description:
      'Продажа, ремонт и перевозка промышленного оборудования для алюминиевых и пластиковых конструкций. Склад в Краснодаре.',
    start_url: '/',
    display: 'standalone',
    background_color: '#101310',
    theme_color: '#101310',
    lang: 'ru',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

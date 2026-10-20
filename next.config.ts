import type { NextConfig } from 'next'

/**
 * Заголовки безопасности. CSP намеренно ограничен только frame-ancestors:
 * полноценный script-src без nonce сломал бы гидрацию Next, а защиту от
 * кликджекинга закрывает именно frame-ancestors.
 * Домены e2b.app / arena.ai нужны, чтобы сайт открывался в песочнице превью.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self' https://*.e2b.app https://*.arena.ai http://localhost:* http://127.0.0.1:*",
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai', 'localhost', '127.0.0.1'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [96, 160, 240, 320, 420],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Загруженные фото и PDF не меняются: имя файла содержит хеш.
        source: '/uploads/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
    ]
  },
}

export default nextConfig
